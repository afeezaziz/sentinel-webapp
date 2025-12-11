import { Bot, User } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatBubbleProps {
  message: Message
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 text-slate-600'
        }
      `}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Header */}
        <div className={`flex items-center space-x-2 mb-1 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className="text-sm font-medium text-slate-700">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          <span className="text-xs text-slate-500">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* Message Bubble */}
        <div className={`
          rounded-lg p-3 max-w-[80%] break-words
          ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-800'
          }
        `}>
          <div className="whitespace-pre-wrap text-sm">
            {formatMessageContent(message.content)}
          </div>
        </div>

        {/* Timestamp (for mobile) */}
        <div className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}

function formatMessageContent(content: string): React.ReactNode {
  // Simple markdown-like formatting for better readability
  return content.split('\n').map((line, index) => {
    if (line.trim() === '') {
      return <br key={index} />
    }

    // Handle bold text
    let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Handle bullet points
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      return (
        <div key={index} className="flex items-start">
          <span className="text-slate-400 mr-2">•</span>
          <span
            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[\s•\-]+/, '') }}
          />
        </div>
      )
    }

    // Handle numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/)
    if (numberedMatch) {
      return (
        <div key={index} className="flex items-start">
          <span className="text-slate-400 mr-2">{numberedMatch[1]}.</span>
          <span
            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\d+\.\s+/, '') }}
          />
        </div>
      )
    }

    // Handle headers (lines ending with colon)
    if (line.endsWith(':')) {
      return (
        <div key={index} className="font-semibold mb-2">
          <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
        </div>
      )
    }

    // Regular text
    return (
      <div key={index}>
        <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
      </div>
    )
  })
}