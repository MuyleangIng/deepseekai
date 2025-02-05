"use client"

import { useEffect, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeGeneratorProps {
  code: string
}

export default function CodeGenerator({ code }: CodeGeneratorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <SyntaxHighlighter language="typescript" style={vscDarkPlus} showLineNumbers>
      {code}
    </SyntaxHighlighter>
  )
}

