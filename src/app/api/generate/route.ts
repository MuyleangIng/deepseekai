// // app/api/generate/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { saveTempFiles, type GeneratedFile } from "@/utils/tempFiles";

// const initializeGeminiAI = () => {
//   const apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) {
//     throw new Error("GEMINI_API_KEY environment variable is not set");
//   }
//   return new GoogleGenerativeAI(apiKey);
// };

// // app/api/generate/route.ts
// export async function POST(request: NextRequest) {
//   try {
//     // Check the content type of the request
//     const contentType = request.headers.get('content-type');

//     // Handle JSON for text-only mode
//     if (contentType?.includes('application/json')) {
//       const { prompt } = await request.json();

//       if (!prompt) {
//         return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
//       }

//       const genAI = initializeGeminiAI();
//       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//       const result = await model.generateContent([
//         {
//           text: `
//             ${prompt ? `User Instructions: ${prompt}\n` : ''}
            
//             Generate a web project based on the provided prompt.
//             Return a JSON object with this format:
//             {
//               "files": {
//                 "index.html": "<!DOCTYPE html>
// <html>
// <head>
// <title>Web Project</title>
// <link rel=\"stylesheet\" href=\"./styles.css\">
// </head>
// <body>
//   <header>
//   </header>
//   <main>
//   </main>
  
//   <script src=\"./script.js\"></script>
// </body>
// </html>",
//                 "styles.css": "/* Your CSS content goes here */",
//                 "script.js": "/* Your JavaScript content goes here */"
//               }
//             }
            
//             IMPORTANT:
//             - Response must be valid JSON only
//             - No text before or after the JSON object
//             - No code block markers
//           `
//         }
//       ]);

//       const text = result.response.text();
//       console.log('Raw AI response:', text);

//       // Clean the response text
//       const cleanedText = text.replace(/```json\n|\n```|```/g, '').trim();
      
//       try {
//         const parsedResponse = JSON.parse(cleanedText);
        
//         if (!parsedResponse.files) {
//           throw new Error('Response missing files object');
//         }

//         // Convert the files object to our expected format
//         const files: GeneratedFile[] = Object.entries(parsedResponse.files).map(([name, content]) => ({
//           name,
//           content: content as string
//         }));

//         // Save the files
//         const { id, files: savedFiles } = await saveTempFiles(files);

//         return NextResponse.json({
//           success: true,
//           projectId: id,
//           files: savedFiles
//         });

//       } catch (parseError) {
//         console.error('Parse error:', parseError);
//         console.error('Cleaned text:', cleanedText);
//         return NextResponse.json({
//           error: 'Failed to parse AI response',
//           details: process.env.NODE_ENV === 'development' ? {
//             error: parseError.message,
//             rawResponse: text.slice(0, 500) + '...' // Truncate for readability
//           } : undefined
//         }, { status: 500 });
//       }
//     } else {
//       return NextResponse.json(
//         { error: "Unsupported content type. Use application/json" }, 
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error("Error in generate route:", error);
//     return NextResponse.json(
//       { 
//         error: error instanceof Error ? error.message : "Failed to process request",
//         details: process.env.NODE_ENV === 'development' ? error : undefined
//       },
//       { status: 500 }
//     );
//   }
// }
// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { saveTempFiles, type GeneratedFile } from "@/utils/tempFiles";

const initializeGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const { prompt } = await request.json();

      if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
      }

      const genAI = initializeGeminiAI();
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent([
        {
          text: `
            ${prompt ? `User Instructions: ${prompt}\n` : ''}
            
            Generate a web project based on the provided prompt.
            For each file, provide:
            1. The file content
            2. A brief explanation of the code
            3. Any key features or functionality

            Return a JSON object with this format:
            {
              "files": {
                "index.html": {
                  "content": "<!DOCTYPE html>...",
                  "explanation": "Main HTML file that...",
                  "features": ["Responsive layout", "...]
                },
                "styles.css": {
                  "content": "/* CSS content */",
                  "explanation": "Stylesheet that...",
                  "features": ["Mobile-first design", "...]
                }
              },
              "overview": "Brief explanation of the overall project structure and how files work together"
            }
            
            IMPORTANT:
            - Response must be valid JSON only
            - Include clear explanations for each file
            - No text before or after the JSON object
            - No code block markers
          `
        }
      ]);

      const text = result.response.text();
      console.log('Raw AI response:', text);

      const cleanedText = text.replace(/```json\n|\n```|```/g, '').trim();
      
      try {
        const parsedResponse = JSON.parse(cleanedText);
        
        if (!parsedResponse.files) {
          throw new Error('Response missing files object');
        }

        // Convert the files object to our expected format with explanations
        const files: GeneratedFile[] = Object.entries(parsedResponse.files).map(([name, fileData]: [string, any]) => ({
          name,
          content: fileData.content,
          explanation: fileData.explanation,
          features: fileData.features,
        }));

        // Save the files
        const { id, files: savedFiles } = await saveTempFiles(files);

        return NextResponse.json({
          success: true,
          projectId: id,
          files: savedFiles,
          overview: parsedResponse.overview,
          explanations: Object.fromEntries(
            files.map(file => [
              file.name,
              {
                explanation: file.explanation,
                features: file.features
              }
            ])
          )
        });

      } catch (parseError) {
        console.error('Parse error:', parseError);
        return NextResponse.json({
          error: 'Failed to parse AI response',
          details: process.env.NODE_ENV === 'development' ? {
            error: parseError.message,
            rawResponse: text.slice(0, 500) + '...'
          } : undefined
        }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported content type. Use application/json" }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in generate route:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to process request",
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}