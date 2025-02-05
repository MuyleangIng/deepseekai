// app/api/chat/route.ts
import { NextRequest } from 'next/server';

// Define message type
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Define request body type
interface ChatRequestBody {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  // Parse request body with type safety
  const body: ChatRequestBody = await request.json();
  const { messages } = body;

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
            messages,
            model: body.model || 'deepseek-chat',
            stream: true,
            max_tokens: body.max_tokens || 2048,
            temperature: body.temperature || 0.7
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