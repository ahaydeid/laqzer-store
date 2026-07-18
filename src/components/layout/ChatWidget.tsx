'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { StoreSettings } from '@/core/types/store'
import { FiChevronDown, FiSend, FiX, FiPackage, FiLoader } from 'react-icons/fi'
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
  const [loadingChat, setLoadingChat] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Inisialisasi Room Chat Supabase saat widget dibuka
  useEffect(() => {
    if (!isChatOpen) return

    let isMounted = true
    setLoadingChat(true)

    chatService
      .getOrCreateRoom(user?.id, { name: user?.user_metadata?.full_name || 'Pembeli' })
      .then(async (room) => {
        if (!isMounted) return
        setRoomId(room.id)

        // Ambil riwayat pesan yang sudah ada dari Supabase
        const history = await chatService.getRoomMessages(room.id)
        if (!isMounted) return

        if (history.length === 0) {
          // Buat pesan sambutan otomatis pertama kali
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
        setLoadingChat(false)
      })
      .catch((err) => {
        console.error('Gagal inisialisasi chat room:', err)
        setLoadingChat(false)
      })

    return () => {
      isMounted = false
    }
  }, [isChatOpen, user, chatService, settings.name])

  // Subskripsi Supabase Realtime Listener untuk pesan baru secara instan
  useEffect(() => {
    if (!roomId || !isChatOpen) return

    const subscription = chatService.subscribeToRoomMessages(roomId, (newMessage) => {
      setMessages((prev) => {
        // Cegah pesan duplikat di state
        if (prev.some((m) => m.id === newMessage.id)) return prev
        return [...prev, newMessage]
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId, isChatOpen, chatService])

  // Auto-focus input field saat widget chat terbuka
  useEffect(() => {
    if (isChatOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isChatOpen])

  // Listen to open-chat-widget global event (Tombol "Chat Admin" di halaman detail produk)
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

  // Auto-scroll ke pesan terbawah
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

    // Reset input state instan untuk pengalaman responsif
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
      {/* Floating Chat Button Toggle */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-rose-600 px-5 py-3.5 text-xs font-bold text-white shadow-xl hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
        >
          <div className="relative">
            <FiSend className="h-4 w-4" />
          </div>
          <span>Chat Admin</span>
        </button>
      )}

      {/* Chat Box Popup Panel */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[360px] sm:w-[390px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 transition-all animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Panel */}
          <div className="flex items-center justify-between bg-zinc-900 px-4 py-3.5 text-white dark:bg-zinc-900">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-white font-bold text-sm">
                  L
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">{settings.name || 'Laqzer Customer Care'}</h3>
                <p className="text-[10px] text-zinc-400">Biasanya membalas dalam beberapa menit</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 thin-scroll bg-zinc-50/50 dark:bg-zinc-950">
            {loadingChat ? (
              <div className="flex h-full flex-col items-center justify-center text-zinc-400 gap-2">
                <FiLoader className="h-6 w-6 animate-spin text-rose-500" />
                <span className="text-xs">Memuat obrolan...</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.senderType === 'user'
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    {/* Attachment Kartu Produk (jika ada) */}
                    {msg.productMetadata && (
                      <div className="mb-1.5 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex gap-2.5">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.productMetadata.imageUrl}
                              alt={msg.productMetadata.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                              {msg.productMetadata.name}
                            </h4>
                            {msg.productMetadata.variant && (
                              <p className="text-[10px] text-zinc-400">{msg.productMetadata.variant}</p>
                            )}
                            <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                              Rp {msg.productMetadata.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Teks Pesan Chat */}
                    {msg.text && (
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-rose-600 text-white rounded-br-none'
                            : 'bg-white text-zinc-800 border border-zinc-200/80 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    )}

                    <span className="mt-1 text-[9px] text-zinc-400 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Pending Product Attachment Banner (Preview sebelum dikirim) */}
          {pendingProduct && (
            <div className="flex items-center justify-between border-t border-zinc-200 bg-rose-50/70 p-2.5 dark:border-zinc-800 dark:bg-rose-950/30 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pendingProduct.imageUrl}
                    alt={pendingProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Lampiran Produk
                  </span>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {pendingProduct.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPendingProduct(null)}
                className="rounded-full p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Footer Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan Anda..."
              className="flex-1 rounded-xl bg-zinc-100 px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:bg-zinc-950"
            />
            <button
              type="submit"
              disabled={!inputText.trim() && !pendingProduct}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 transition-all cursor-pointer shrink-0"
            >
              <FiSend className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
