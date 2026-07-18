"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSend, FiChevronLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SupabaseChatService } from "@/services/supabase/chat.service";
import { ChatMessageRecord } from "@/core/types/chat";
import { useAuth } from "@/components/providers/AuthProvider";

export interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  verified?: boolean;
}

export interface ChatDetailPanelProps {
  chatId: string;
  mode?: "page" | "panel";
  onBack?: () => void;
}

export const ChatDetailPanel: React.FC<ChatDetailPanelProps> = ({ chatId, mode = "panel", onBack }) => {
  const router = useRouter();
  const { user } = useAuth();
  const chatService = useMemo(() => new SupabaseChatService(), []);

  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat messages from Supabase
  useEffect(() => {
    let isMounted = true;
    setLoadingMessages(true);

    chatService
      .getRoomMessages(chatId)
      .then((history) => {
        if (!isMounted) return;
        setMessages(history);
        setLoadingMessages(false);
      })
      .catch((err) => {
        console.error("Gagal memuat pesan admin:", err);
        setLoadingMessages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [chatId, chatService]);

  // Subskripsi Supabase Realtime Listener untuk pesan baru dalam room
  useEffect(() => {
    if (!chatId) return;

    const subscription = chatService.subscribeToRoomMessages(chatId, (newMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, chatService]);

  // Auto-scroll ke pesan terbawah
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Auto expand textarea height up to 120px
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const nextHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${nextHeight}px`;

      // Dynamically adjust roundedness based on height
      if (nextHeight <= 48) {
        textarea.style.borderRadius = "9999px"; // rounded-full
      } else {
        textarea.style.borderRadius = "1.75rem"; // rounded-xl
      }

      if (textarea.scrollHeight > 120) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatId) return;

    const textToSend = inputText.trim();
    setInputText("");

    try {
      await chatService.sendMessage(chatId, "admin", textToSend, null, user?.id);
    } catch (err) {
      console.error("Gagal mengirim balasan admin:", err);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Detail Panel Header (Strictly Asli UI) */}
      <div className="flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 shrink-0 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {mode === "page" && (
            <button
              onClick={() => {
                if (onBack) onBack();
                else router.push("/admin/chat");
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 mr-1 cursor-pointer"
              title="Kembali"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(chatId)}`}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex flex-col justify-center h-9">
            <span className="font-semibold text-sm leading-none truncate text-zinc-900 dark:text-zinc-100">
              Obrolan Pembeli #{chatId.slice(0, 8)}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] leading-none text-zinc-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll View (Strictly Asli UI dengan ekor SVG & bubble hijau mint) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scroll">
        {loadingMessages ? (
          <div className="text-center text-zinc-400 text-xs py-12">Memuat pesan...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-zinc-400 text-xs py-12">Belum ada pesan dalam obrolan ini.</div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.senderType === "admin";
            return (
              <div
                key={msg.id}
                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
              >
                {msg.productMetadata ? (
                  <Link
                    href={`/product/${msg.productMetadata.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2.5 flex gap-3 w-[260px] text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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
                        Rp{msg.productMetadata.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </Link>
                ) : isAdmin ? (
                  <div className="flex items-start max-w-[70%] justify-end">
                    <div className="bg-emerald-200 text-zinc-950 rounded-l-xl rounded-b-xl px-4 py-2.5 text-sm">
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <span className="text-[9px] block text-right mt-1.5 text-zinc-600">
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <svg className="w-2 h-2 text-emerald-200 fill-current shrink-0 -ml-[0.5px]" viewBox="0 0 10 10">
                      <path d="M0 0 L10 0 L0 10 Z" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-start max-w-[70%]">
                    <svg className="w-2 h-2 text-slate-100 dark:text-zinc-800 fill-current shrink-0 -mr-[0.5px]" viewBox="0 0 10 10">
                      <path d="M10 0 L0 0 L10 10 Z" />
                    </svg>
                    <div className="bg-slate-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-r-xl rounded-b-xl px-4 py-2.5 text-sm">
                      <p className="leading-relaxed break-words">{msg.text}</p>
                      <span className="text-[9px] block text-right mt-1.5 text-zinc-400 dark:text-zinc-500">
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Strictly Asli UI dengan Textarea Auto-expand & rounded-full) */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tulis pesan..."
            className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 py-2.5 px-4 text-sm outline-none focus:border-sky-500 dark:focus:border-sky-400 focus:ring-0 transition-all duration-150 resize-none overflow-hidden max-h-[120px] leading-relaxed"
            style={{ height: "40px", borderRadius: "9999px" }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-700 hover:bg-sky-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer mb-0.5"
            title="Kirim"
          >
            <FiSend className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
