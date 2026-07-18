'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { StoreSettings } from '@/core/types/store'
import { FiChevronDown, FiSend, FiX } from 'react-icons/fi'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { SupabaseChatService } from '@/services/supabase/chat.service'
import { ChatMessageRecord, ProductAttachment } from '@/core/types/chat'

interface ChatWidgetProps {
  settings: StoreSettings
}

export function ChatWidget({ settings }: ChatWidgetProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const chatService = useMemo(() => new SupabaseChatService(), [])

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [pendingProduct, setPendingProduct] = useState<ProductAttachment | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageRecord[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inisialisasi Room Chat Supabase saat widget dibuka
  useEffect(() => {
    if (!isChatOpen) return

    let isMounted = true

    chatService
      .getOrCreateRoom(user?.id, { name: user?.user_metadata?.full_name || 'Pembeli' })
      .then(async (room) => {
        if (!isMounted) return
        setRoomId(room.id)

        const history = await chatService.getRoomMessages(room.id)
        if (!isMounted) return

        if (history.length === 0) {
          await chatService.sendMessage(
            room.id,
            'admin',
            `Halo! Selamat datang di ${settings.name || 'Laqzer Store'}. Ada yang bisa kami bantu hari ini?`
          )
          const updatedHistory = await chatService.getRoomMessages(room.id)
          setMessages(updatedHistory)
        } else {
          setMessages(history)
        }
      })
      .catch((err) => {
        console.error('Gagal inisialisasi chat room:', err)
      })

    return () => {
      isMounted = false
    }
  }, [isChatOpen, user, chatService, settings.name])

  // Subskripsi Supabase Realtime Listener
  useEffect(() => {
    if (!roomId || !isChatOpen) return

    const subscription = chatService.subscribeToRoomMessages(roomId, (newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev
        return [...prev, newMessage]
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId, isChatOpen, chatService])

  // Auto-focus input field
  useEffect(() => {
    if (isChatOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isChatOpen])

  // Listen to open-chat-widget global event
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ product?: ProductAttachment }>
      setIsChatOpen(true)
      if (customEvent.detail && customEvent.detail.product) {
        setPendingProduct(customEvent.detail.product)
      }
    }

    window.addEventListener('open-chat-widget', handleOpenChat)
    return () => {
      window.removeEventListener('open-chat-widget', handleOpenChat)
    }
  }, [])

  // Auto-scroll ke bawah
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isChatOpen])

  if (pathname?.startsWith('/admin')) {
    return null
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim() && !pendingProduct) return
    if (!roomId) return

    const currentText = inputText.trim()
    const currentProduct = pendingProduct

    setInputText('')
    setPendingProduct(null)

    try {
      await chatService.sendMessage(roomId, 'user', currentText, currentProduct, user?.id)
    } catch (err) {
      console.error('Gagal mengirim pesan:', err)
    }
  }

  return (
    <>
      {/* Container Chat Widget Slide Up Panel (Strictly Asli UI) */}
      <div
        className={`fixed bottom-0 right-3 sm:right-6 z-40 w-[340px] sm:w-[380px] h-[480px] sm:h-[520px] bg-white dark:bg-zinc-950 rounded-t-xl border border-zinc-200 dark:border-zinc-800 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] flex flex-col transition-all duration-300 origin-bottom-right transform ${
          isChatOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-12 pointer-events-none'
        }`}
      >
        {/* Header Widget */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 rounded-t-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo Laqzer */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white dark:bg-zinc-950 flex items-center justify-center p-1 border border-zinc-200 dark:border-zinc-800 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/logo-laqzer-transparan.png"
                alt="L"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                {settings.name || 'Laqzer Customer Care'}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-none">
                  online
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-500">
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              <FiChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-zinc-950 thin-scroll">
          {messages.map((msg) => {
            const isUser = msg.senderType === 'user'
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Kartu Produk (jika ada) */}
                {msg.productMetadata ? (
                  <Link
                    href={`/product/${msg.productMetadata.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2.5 flex gap-3 w-[260px] text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={msg.productMetadata.imageUrl}
                      alt={msg.productMetadata.name}
                      className="w-12 h-12 rounded-sm object-cover bg-white dark:bg-zinc-950 shrink-0"
                    />
                    <div className="flex flex-col min-w-0 justify-between">
                      <div>
                        <h5 className="text-[11px] font-semibold text-zinc-850 dark:text-zinc-200 truncate leading-tight" title={msg.productMetadata.name}>
                          {msg.productMetadata.name}
                        </h5>
                        {msg.productMetadata.variant && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Varian: {msg.productMetadata.variant}
                          </p>
                        )}
                      </div>
                      <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mt-1">
                        Rp {msg.productMetadata.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </Link>
                ) : isUser ? (
                  <div className="flex items-start max-w-[75%] justify-end">
                    <div className="bg-emerald-200 text-zinc-950 rounded-l-xl rounded-b-xl px-4 py-2.5 text-sm shadow-xs">
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <span className="text-[9px] block text-right mt-1.5 text-zinc-600">
                        {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
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
                        {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Pending Product Attachment Card */}
        {pendingProduct && (
          <div className="px-3.5 py-2 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pendingProduct.imageUrl} className="w-8 h-8 rounded object-cover shrink-0" alt="" />
              <div className="truncate">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{pendingProduct.name}</p>
                <p className="text-[10px] text-zinc-500">Rp {pendingProduct.price.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPendingProduct(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3.5 bg-white border-t border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 flex items-center gap-2 shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim() && !pendingProduct}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all flex-shrink-0 cursor-pointer"
          >
            <FiSend className="h-5 w-5 ml-0.5" />
          </button>
        </form>
      </div>

      {/* Floating Chat Widget Toggle Button (Strictly Asli UI) */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-0 right-3 z-30 flex items-center gap-2.5 rounded-t-lg bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.25)] dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 active:scale-95 transition-all duration-300 group cursor-pointer origin-bottom-right transform ${
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
