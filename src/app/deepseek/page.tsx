import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800">DeepSeek Chat</h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        <ChatInterface />
      </main>
      <footer className="bg-white shadow-md mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-gray-600">
          Powered by DeepSeek AI
        </div>
      </footer>
    </div>
  );
}
