import { type NextRequest, NextResponse } from "next/server"
import { pipeline } from "@xenova/transformers"

let generator: any = null

async function initializeGenerator() {
  if (!generator) {
    generator = await pipeline("text-generation", "Xenova/codegen-350M-mono")
  }
}

export async function POST(request: NextRequest) {
  await initializeGenerator()

  const { prompt } = await request.json()

  try {
    const result = await generator(prompt, {
      max_new_tokens: 256,
      temperature: 0.7,
      top_p: 0.95,
    })

    const generatedCode = result[0].generated_text

    return NextResponse.json({ generatedCode })
  } catch (error) {
    console.error("Error generating code:", error)
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}

