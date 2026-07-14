'use client'

import { useState, useRef, useEffect } from 'react'
import { StoreSettings } from '@/core/types/store'
import { FiChevronDown, FiSend } from 'react-icons/fi'

interface Message {
  id: string
  sender: 'admin' | 'user'
  text: string
  timestamp: string
}

interface ChatWidgetProps {
  settings: StoreSettings
}

export function ChatWidget({ settings }: ChatWidgetProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'admin',
      text: `Halo! Selamat datang di ${settings.name || 'Laqzer Store'}. Ada yang bisa kami bantu hari ini?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }
  ])

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isChatOpen])

  const phone = settings.phone || '081234567890'
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  const formattedPhone = cleanPhone.startsWith('0') 
    ? '62' + cleanPhone.slice(1) 
    : cleanPhone

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, newMessage])
    const typedText = inputText
    setInputText('')

    // Simulate redirect to WhatsApp with the user's message
    setTimeout(() => {
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(typedText)}`
      window.open(whatsappUrl, '_blank')
    }, 400)
  }

  return (
    <>
      {/* Floating Chat Widget Window */}
      <div 
        className={`fixed bottom-0 right-3 z-50 w-[420px] max-w-[calc(100vw-24px)] h-[540px] bg-white rounded-t-lg shadow-2xl border-t border-x border-zinc-100 flex flex-col overflow-hidden dark:bg-zinc-950 dark:border-zinc-800 transition-all duration-300 origin-bottom-right transform ${
          isChatOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 bg-white dark:bg-zinc-950 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Operator Icon (Person wearing headset and mic) */}
            {/* Operator Icon (Dicebear Avatar) */}
            <div className="h-8 w-8 rounded-full overflow-hidden bg-rose-50 dark:bg-zinc-800 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=minLaq" 
                alt="minLaq" 
                className="h-full w-full object-cover"
              />
            </div>
            {/* Operator Name and Status */}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                MinLaq
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-none">
                  online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
            <button 
              onClick={() => setIsChatOpen(false)}
              className="hover:text-red-500 transition-colors"
            >
              <FiChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-950">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {isUser ? (
                  <div className="flex items-start max-w-[75%] justify-end">
                    <div className="bg-emerald-200 text-zinc-950 rounded-l-xl rounded-b-xl px-4 py-2.5 text-sm shadow-xs">
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <span className="text-[9px] block text-right mt-1.5 text-zinc-600">
                        {msg.timestamp}
                      </span>
                    </div>
                    <svg className="w-2 h-2 text-emerald-200 fill-current shrink-0 -ml-[0.5px]" viewBox="0 0 10 10">
                      <path d="M0 0 L10 0 L0 10 Z" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-start max-w-[75%]">
                    <svg className="w-2 h-2 text-slate-100 dark:text-zinc-800 fill-current shrink-0 -mr-[0.5px]" viewBox="0 0 10 10">
                      <path d="M10 0 L0 0 L10 10 Z" />
                    </svg>
                    <div className="bg-slate-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-r-xl rounded-b-xl px-4 py-2.5 text-sm shadow-xs">
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <span className="text-[9px] block text-right mt-1.5 text-zinc-400 dark:text-zinc-500">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={handleSendMessage}
          className="p-3.5 bg-white border-t border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex-shrink-0"
          >
            <FiSend className="h-5 w-5 ml-0.5" />
          </button>
        </form>
      </div>

      {/* Floating Chat Widget Toggle Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-0 right-3 z-50 flex items-center gap-2.5 rounded-t-lg bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.25)] dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:scale-95 transition-all duration-300 group cursor-pointer origin-bottom-right transform ${
          isChatOpen 
            ? 'opacity-0 scale-90 translate-y-8 pointer-events-none' 
            : 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
        }`}
      >
        {/* Rose Chat Bubble Icon */}
        <div className="relative h-7 w-7">
          {/* Back bubble */}
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="absolute right-0 bottom-0 h-5 w-5 opacity-30 text-rose-300 dark:text-rose-900"
          >
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          {/* Front bubble */}
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="absolute left-0 top-0 h-5.5 w-5.5 text-rose-500 dark:text-rose-400"
          >
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            {/* Smile Mouth */}
            <path 
              d="M9 10c0 0 1 2 3 2s3-2 3-2" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              fill="none" 
            />
          </svg>
        </div>

        {/* Label */}
        <span className="text-lg font-bold tracking-wide text-rose-500 dark:text-rose-400">
          Chat
        </span>
      </button>
    </>
  )
}
