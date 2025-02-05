import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodePreviewProps {
  code: string
}

export default function CodePreview({ code }: CodePreviewProps) {
  return (
    <SyntaxHighlighter language="typescript" style={vscDarkPlus} showLineNumbers>
      {code}
    </SyntaxHighlighter>
  )
}

