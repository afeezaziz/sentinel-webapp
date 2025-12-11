import { useState, useRef, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { ScrollArea } from '../ui/scroll-area'
import ChatBubble from './ChatBubble'
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AssetChatProps {
  assetId?: string
  assetName?: string
}

export default function AssetChat({ assetId, assetName = 'Pipeline System' }: AssetChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI pipeline assistant. I can help you analyze data, provide insights about ${assetName}, answer questions about risk assessments, and assist with inspection workflows.

How can I help you today?`,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Simulate AI response delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Generate mock AI response
      const aiResponse = await generateMockAIResponse(input.trim(), messages)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-96 h-[600px] p-0 shadow-2xl"
          align="end"
          side="top"
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Pipeline Assistant</h3>
                <p className="text-xs text-slate-600">{assetName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-slate-600">Online</span>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea
            ref={scrollAreaRef}
            className="flex-1 h-[400px] p-4 space-y-4"
          >
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                message={message}
              />
            ))}

            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-slate-600 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-slate-700">AI Assistant</span>
                    <span className="text-xs text-slate-500">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bg-slate-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex space-x-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about pipeline risks, inspection data, or maintenance recommendations..."
                className="min-h-[80px] resize-none border-slate-300 focus:border-slate-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>Press Enter to send, Shift+Enter for new line</span>
              <span>Powered by Sentinel</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Mock AI response generator
async function generateMockAIResponse(userInput: string, conversationHistory: Message[]): Promise<string> {
  const input = userInput.toLowerCase()

  // Risk-related queries
  if (input.includes('risk') || input.includes('danger') || input.includes('threat')) {
    return `Based on current pipeline monitoring data, I can see several risk factors that require attention:

**Current Risk Assessment:**
- High-risk excavation activities detected in Sector A-12
- Medium-risk vehicle access patterns in Agricultural zones
- Low-risk ground disturbances in forested areas

**Recommendations:**
1. Immediate inspection required for high-risk excavation activities
2. Increase monitoring frequency in medium-risk zones
3. Continue normal monitoring for low-risk disturbances

Would you like me to provide specific details about any particular risk area or generate a comprehensive risk report?`
  }

  // Inspection-related queries
  if (input.includes('inspection') || input.includes('check') || input.includes('verify')) {
    return `I can help you with inspection workflows. Here are the current inspection priorities:

**Priority 1 - Immediate (Within 24 hours):**
- Alert #1: High Risk Excavation Activity (Risk Score: 9/10)
- Alert #7: Unauthorized Drilling Activity (Risk Score: 9/10)

**Priority 2 - Urgent (Within 48 hours):**
- Alert #4: Construction Activity Near Pipeline (Risk Score: 7/10)
- Alert #5: Heavy Machinery Movement (Risk Score: 8/10)

**Inspection Checklist:**
- Visual verification of site conditions
- Risk assessment matrix completion
- Before/after imagery capture
- Engineer notes documentation

Would you like me to generate detailed inspection reports for any specific alerts?`
  }

  // Data analysis queries
  if (input.includes('data') || input.includes('analysis') || input.includes('pattern')) {
    return `Analyzing current pipeline monitoring data:

**Trend Analysis (Last 7 Days):**
- Total alerts: 47 (↑ 12% from previous week)
- High-risk alerts: 8 (↑ 15%)
- Average response time: 2.3 hours (↓ 18% improvement)

**Geographic Distribution:**
- Industrial zones: 45% of total alerts
- Agricultural areas: 32% of total alerts
- Forest reserves: 15% of total alerts
- Residential areas: 8% of total alerts

**Key Insights:**
1. Increased activity in industrial corridors requires monitoring
2. Response times have improved significantly
3. Seasonal patterns show increased construction activity

Would you like me to dive deeper into any specific aspect of this analysis?`
  }

  // Maintenance and procedures
  if (input.includes('maintenance') || input.includes('procedure') || input.includes('protocol')) {
    return `Here are the standard maintenance procedures and protocols:

**Routine Maintenance Schedule:**
- Daily: Visual monitoring and alert review
- Weekly: Risk assessment updates and report generation
- Monthly: Comprehensive pipeline inspection
- Quarterly: Equipment calibration and system maintenance

**Emergency Protocols:**
1. High-Risk Alert Response (≤1 hour):
   - Immediate site verification
   - Risk assessment completion
   - Stakeholder notification

2. Medium-Risk Alert Response (≤4 hours):
   - Site investigation
   - Risk matrix analysis
   - Mitigation planning

3. Low-Risk Alert Response (≤24 hours):
   - Documentation review
   - Risk level confirmation
   - Monitoring adjustment

**Documentation Requirements:**
- Inspection reports with before/after imagery
- Risk assessment matrix completion
- Engineer notes and recommendations
- Follow-up monitoring schedule

Would you like detailed procedures for any specific maintenance activity?`
  }

  // Default response
  return `I understand you're asking about "${userInput}". As your AI pipeline assistant, I can help you with:

• **Risk Assessment**: Analyze current pipeline risks and threat levels
• **Inspection Support**: Generate inspection reports and checklists
• **Data Analysis**: Provide insights from monitoring data and trends
• **Maintenance Procedures**: Offer guidance on standard protocols
• **Emergency Response**: Assist with critical alert handling

Could you please rephrase your question or let me know which specific area you'd like help with? I'm here to assist with pipeline monitoring, risk management, and operational decisions.`
}