// app/api/code-assist/route.ts
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const { messages, context } = await request.json();

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `You are an advanced AI code assistant. Guidelines:
                1. Provide clean, production-ready code
                2. Use modern best practices
                3. Include concise explanations
                4. Context: ${context}`
              },
              ...messages
            ],
            model: 'deepseek-chat',
            stream: true,
            max_tokens: 4096,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`API response error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const trimmedLine = line.replace('data: ', '').trim();
                if (trimmedLine === '[DONE]') break;

                const parsedChunk = JSON.parse(trimmedLine);
                const content = parsedChunk.choices[0]?.delta?.content;

                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch (parseError) {
                console.error('Parsing error:', parseError);
              }
            }
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}