import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism"

interface MessageContent {
  type: 'text' | 'code'
  content: string
  language?: string
  explanation?: string
}

interface Message {
  type: "user" | "assistant"
  content: MessageContent[]
  timestamp: Date
}

interface ChatPreviewProps {
  messages: Message[]
}

export function ChatPreview({ messages }: ChatPreviewProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-8">
        {messages.map((message, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            {message.type === "assistant" ? (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
            
            <div className="flex-1 space-y-4">
              {message.content.map((content, contentIdx) => {
                if (content.type === 'code') {
                  return (
                    <div key={contentIdx} className="space-y-2">
                      {content.explanation && (
                        <p className="text-sm text-gray-700">{content.explanation}</p>
                      )}
                      <div className="relative">
                        <SyntaxHighlighter
                          language={content.language}
                          style={tomorrow}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                          }}
                          showLineNumbers
                        >
                          {content.content}
                        </SyntaxHighlighter>
                      </div>
                      {content.explanation && (
                        <div className="mt-2 text-sm text-gray-600">
                          Features:
                          <ul className="list-disc ml-4 mt-1 space-y-1">
                            {content.explanation.split('\n').map((feature, i) => (
                              <li key={i}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <div key={contentIdx} className="text-sm text-gray-700">
                    {content.content}
                  </div>
                )
              })}
              <div className="text-xs text-gray-400">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}