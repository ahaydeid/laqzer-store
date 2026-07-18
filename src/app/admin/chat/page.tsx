"use client";

import { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMessageSquare, FiSearch, FiLoader } from "react-icons/fi";
import { ChatDetailPanel } from "./ChatComponents";
import { SupabaseChatService } from "@/services/supabase/chat.service";
import { ChatRoomRecord } from "@/core/types/chat";
import useSWR from "swr";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center text-zinc-400 text-xs py-8">Memuat obrolan...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState("");
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const chatService = useMemo(() => new SupabaseChatService(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChatId = searchParams.get("room");

  // Fetch real admin rooms using useSWR
  const { data: chatList = [], isLoading, mutate } = useSWR<ChatRoomRecord[]>(
    "admin-chat-rooms-list",
    () => chatService.getAdminRooms(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  // Subskripsi Supabase Realtime Listener untuk pembaruan daftar room admin secara instan
  useEffect(() => {
    const subscription = chatService.subscribeToAdminRooms(() => {
      mutate();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatService, mutate]);

  // Click outside search box to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setSearchMode(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered chat list
  const filteredChats = chatList.filter((chat) =>
    chat.userName.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectChat = async (chatId: string) => {
    // Clear admin unread count in DB
    try {
      await chatService.clearAdminUnread(chatId);
      mutate();
    } catch (_) {}

    if (window.matchMedia("(min-width: 768px)").matches) {
      router.replace(`/admin/chat?room=${chatId}`, { scroll: false });
    } else {
      router.push(`/admin/chat/${chatId}`);
    }
  };

  return (
    <div className="-mx-6 -my-6 md:-mx-8 md:-my-8 h-screen p-4 overflow-hidden">
      <div className="h-full md:grid md:grid-cols-[380px_1fr] overflow-hidden bg-white dark:bg-zinc-900/40">
        {/* Left Column: Chat List */}
        <div className="flex flex-col md:h-full md:overflow-hidden md:border-r md:border-zinc-200 dark:md:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 px-4 pt-4 pb-3 mb-2 relative shrink-0">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Pesan</h1>
            <button 
              aria-label="Cari" 
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer" 
              onClick={() => setSearchMode((v) => !v)}
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {searchMode && (
              <div ref={searchBoxRef} className="absolute right-0 top-full mt-2 w-full max-w-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg p-2 z-50">
                <input 
                  type="text" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  placeholder="Cari pengguna..." 
                  className="w-full border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs bg-transparent outline-none focus:border-zinc-400 dark:focus:border-zinc-600" 
                  autoFocus 
                />
              </div>
            )}
          </div>

          {/* Chat List Items */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-1 thin-scroll">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
                <FiLoader className="w-5 h-5 animate-spin text-sky-600" />
                <span className="text-xs">Memuat daftar obrolan...</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center text-zinc-400 text-xs py-8">Tidak ada percakapan ditemukan.</div>
            ) : (
              filteredChats.map((chat) => {
                const showUnread = chat.unreadCountAdmin > 0;
                const isSelected = selectedChatId === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={`flex items-start p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors duration-150 cursor-pointer ${
                      isSelected ? "bg-zinc-100 dark:bg-zinc-800/60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(chat.userName)}`} 
                          alt={chat.userName} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-50">{chat.userName}</p>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[13px] truncate mt-0.5">{chat.lastMessage || 'Memulai percakapan'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center text-right shrink-0 ml-2">
                      <span className="text-xs text-zinc-400">
                        {new Date(chat.updatedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {showUnread && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center mt-1">
                          {chat.unreadCountAdmin}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Detail Panel (Desktop only) */}
        <div className="hidden md:block md:h-full md:overflow-hidden bg-white dark:bg-zinc-950">
          {selectedChatId ? (
            <ChatDetailPanel
              key={selectedChatId}
              chatId={selectedChatId}
              mode="panel"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
              <FiMessageSquare className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-800" />
              <p className="text-xs font-semibold">Pilih percakapan untuk membalas pesan pembeli.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
