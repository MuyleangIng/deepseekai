import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Copy, Save } from 'lucide-react';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface CodePreviewProps {
  file: {
    name: string;
    content: string;
  };
  onSave?: (filename: string, content: string) => Promise<void>;
}

export function CodePreview({ file, onSave }: CodePreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(file.content);

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'dockerfile': return 'docker';
      case 'py': return 'python';
      case 'js': return 'javascript';
      case 'jsx': return 'jsx';
      case 'ts': return 'typescript';
      case 'tsx': return 'tsx';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'css': return 'css';
      case 'html': return 'html';
      default: return 'plaintext';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-2 rounded-t-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <X className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{file.name}</span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {onSave && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  className="h-8 px-2 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={async () => {
                    await onSave(file.name, content);
                    setIsEditing(false);
                  }}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Code area */}
      <Card className="rounded-t-none border border-t-0 border-gray-200 overflow-hidden">
        {isEditing ? (
          <textarea
            className="w-full h-full p-4 font-mono text-sm bg-white text-gray-800 border-0 resize-none focus:ring-0 focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ lineHeight: '1.5rem', minHeight: '400px' }}
          />
        ) : (
          <SyntaxHighlighter
            language={getLanguage(file.name)}
            style={oneLight}
            showLineNumbers
            customStyle={{
              margin: 0,
              background: "white",
              fontSize: "0.875rem",
              lineHeight: "1.5rem",
            }}
            lineNumberStyle={{
              minWidth: "3em",
              paddingRight: "1em",
              textAlign: "right",
              color: "rgb(156, 163, 175)", // gray-400
              backgroundColor: "rgb(249, 250, 251)", // gray-50
              borderRight: "1px solid rgb(229, 231, 235)", // gray-200
            }}
            lineProps={{
              style: { display: "block", width: "fit-content" }
            }}
          >
            {content}
          </SyntaxHighlighter>
        )}
      </Card>
    </div>
  );
}