"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2 } from 'lucide-react'

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)
  const inputRef = useRef<null | HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const newUserMessage: Message = {
      role: "user",
      content: currentMessage,
    }

    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)
    setCurrentMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessageIndex = newMessages.length - 1
          newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            content: newMessages[lastMessageIndex].content + chunk,
          }
          return newMessages
        })
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex items-end space-x-2">
          <textarea
            ref={inputRef}
            value={currentMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !currentMessage.trim()}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors duration-200"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  )
}