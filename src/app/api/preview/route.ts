import { type NextRequest, NextResponse } from "next/server"
import { getProjectFiles } from "@/utils/tempFiles"
import { createSandbox } from "@/utils/sandbox"

export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    const files = await getProjectFiles(projectId)

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "Project not found or empty" }, { status: 404 })
    }

    // Create a sandbox environment for the project
    const sandboxUrl = await createSandbox(files)

    return NextResponse.json({
      success: true,
      previewUrl: sandboxUrl,
    })
  } catch (error) {
    console.error("Error in preview route:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create preview",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}

