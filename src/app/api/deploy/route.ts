import { type NextRequest, NextResponse } from "next/server"
import { deployProject } from "@/lib/deployment"

export async function POST(request: NextRequest) {
  const { files } = await request.json()

  try {
    const previewUrl = await deployProject(files)
    return NextResponse.json({ previewUrl })
  } catch (error) {
    console.error("Error deploying project:", error)
    return NextResponse.json({ error: "Failed to deploy project" }, { status: 500 })
  }
}

