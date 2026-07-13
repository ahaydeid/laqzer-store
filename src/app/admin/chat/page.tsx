"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiMessageSquare, FiSearch } from "react-icons/fi";
import { ChatItem, initialChats, ChatDetailPanel } from "./ChatComponents";

export default function ChatPage() {
  const [searchMode, setSearchMode] = useState(false);
  const [query, setQuery] = useState("");
  const [chatList, setChatList] = useState<ChatItem[]>(initialChats);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChatId = searchParams.get("room");

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
    chat.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectChat = (chatId: string) => {
    // Clear unread badge in state only
    setChatList(prev => prev.map(c =>
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    ));

    if (window.matchMedia("(min-width: 768px)").matches) {
      router.replace(`/admin/chat?room=${chatId}`, { scroll: false });
    } else {
      router.push(`/admin/chat/${chatId}`);
    }
  };

  return (
    <div className="-mx-6 -my-6 md:-mx-8 md:-my-8 h-screen p-4 overflow-hidden">
      <div className="h-full md:grid md:grid-cols-[360px_1fr] overflow-hidden bg-white dark:bg-zinc-900/40">
      {/* Left Column: Chat List */}
      <div className="flex flex-col md:h-full md:overflow-hidden md:border-r md:border-zinc-200 dark:md:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 px-4 pt-4 pb-3 mb-2 relative shrink-0">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Pesan</h1>
          <button 
            aria-label="Cari" 
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500" 
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
          {filteredChats.map((chat) => {
            const showUnread = chat.unreadCount > 0;
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
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(chat.name)}`} 
                      alt={chat.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-xs truncate text-zinc-900 dark:text-zinc-50">{chat.name}</p>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs truncate mt-0.5">{chat.lastMessage}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-center text-right shrink-0 ml-2">
                  <span className="text-[10px] text-zinc-400">
                    {chat.time}
                  </span>
                  {showUnread && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center mt-1">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {filteredChats.length === 0 && (
            <div className="text-center text-zinc-400 text-xs py-8">Tidak ada pesan ditemukan.</div>
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
            <p className="text-xs font-semibold">Pilih percakapan untuk memulai chat.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
