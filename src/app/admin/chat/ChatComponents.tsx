"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSend, FiChevronLeft, FiLoader, FiPackage } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SupabaseChatService } from "@/services/supabase/chat.service";
import { ChatMessageRecord } from "@/core/types/chat";
import { useAuth } from "@/components/providers/AuthProvider";

export interface ChatDetailPanelProps {
  chatId: string;
  mode?: "page" | "panel";
  onBack?: () => void;
}

export const ChatDetailPanel: React.FC<ChatDetailPanelProps> = ({ chatId, mode = "panel" }) => {
  const router = useRouter();
  const { user } = useAuth();
  const chatService = useMemo(() => new SupabaseChatService(), []);

  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {mode === "page" && (
            <button
              onClick={() => router.push("/admin/chat")}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(chatId)}`}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-50">Obrolan Pembeli #{chatId.slice(0, 6)}</h2>
            <p className="text-[11px] text-zinc-400">Balasan langsung via Realtime Supabase</p>
          </div>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 thin-scroll bg-zinc-50/40 dark:bg-zinc-950">
        {loadingMessages ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-400 gap-2">
            <FiLoader className="h-6 w-6 animate-spin text-sky-600" />
            <span className="text-xs">Memuat pesan...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-zinc-400 text-xs py-12">Belum ada pesan dalam obrolan ini.</div>
        ) : (
          messages.map((msg) => {
            const isAdmin = msg.senderType === "admin";
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
              >
                {/* Product Attachment (jika dikirim pembeli) */}
                {msg.productMetadata && (
                  <div className="mb-1.5 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
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
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider block">Produk Ditanyakan</span>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {msg.productMetadata.name}
                        </h4>
                        {msg.productMetadata.variant && (
                          <p className="text-[10px] text-zinc-400">{msg.productMetadata.variant}</p>
                        )}
                        <p className="text-xs font-extrabold text-zinc-900 dark:text-white mt-0.5">
                          Rp {msg.productMetadata.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Text */}
                {msg.text && (
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isAdmin
                        ? "bg-sky-600 text-white rounded-br-none"
                        : "bg-white text-zinc-800 border border-zinc-200/80 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                )}

                <span className="mt-1 text-[9px] text-zinc-400 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800 bg-white p-3 dark:bg-zinc-900 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ketik balasan admin..."
          className="flex-1 rounded-xl bg-zinc-100 px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500 dark:focus:bg-zinc-950"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 disabled:hover:bg-sky-600 transition-all cursor-pointer shrink-0"
        >
          <FiSend className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
