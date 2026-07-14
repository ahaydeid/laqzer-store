import React, { useState, useEffect, useRef } from "react";
import { FiSend, FiChevronLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  verified?: boolean;
}

export interface Message {
  id: string;
  sender: "admin" | "customer";
  text: string;
  time: string;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    variant?: string;
  };
}

export const initialChats: ChatItem[] = [
  { id: "1", name: "Farhan Maulana", lastMessage: "Oke min langsung saya order ya. Makasih!", time: "09:30", unreadCount: 2, verified: false },
  { id: "2", name: "Siti Rahma", lastMessage: "Sudah saya bayar ya kak, tolong diproses", time: "Kemarin", unreadCount: 0, verified: true },
  { id: "3", name: "Andi Wijaya", lastMessage: "Bisa kirim pakai Grab Sameday?", time: "08:15", unreadCount: 0, verified: false },
  { id: "4", name: "Dewi Kusuma", lastMessage: "Ukuran M masih ada kak?", time: "07:55", unreadCount: 3, verified: false },
  { id: "5", name: "Reza Pratama", lastMessage: "Tolong cek resi saya ya min", time: "Kemarin", unreadCount: 1, verified: false },
  { id: "6", name: "Nurul Hidayah", lastMessage: "Kapan restock warna hitamnya?", time: "Senin", unreadCount: 0, verified: true },
  { id: "7", name: "Fajar Setiawan", lastMessage: "Min ada diskon tidak bulan ini?", time: "Senin", unreadCount: 0, verified: false },
  { id: "8", name: "Lina Marlina", lastMessage: "Pesanan saya belum sampai min", time: "Minggu", unreadCount: 4, verified: false },
  { id: "9", name: "Hendra Kusuma", lastMessage: "Apakah bisa COD area Bandung?", time: "Minggu", unreadCount: 0, verified: false },
  { id: "10", name: "Maya Putri", lastMessage: "Boleh minta foto produknya lebih?", time: "Sabtu", unreadCount: 0, verified: true },
  { id: "11", name: "Tono Subagyo", lastMessage: "Paket sudah diterima, terima kasih!", time: "Sabtu", unreadCount: 0, verified: false },
  { id: "12", name: "Indri Wulandari", lastMessage: "Apakah ada garansi produknya kak?", time: "Jumat", unreadCount: 2, verified: false },
  { id: "13", name: "Rizal Hakim", lastMessage: "Mau tanya stok celana panjangnya kak", time: "Jumat", unreadCount: 1, verified: false }
];

export const initialMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "prod-farhan-1",
      sender: "customer",
      text: "",
      time: "09:27",
      product: {
        id: "p-1",
        name: "Essentials Men's Oxford Long Sleeve Shirt",
        price: 179000,
        imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
        variant: "Hitam"
      }
    },
    { id: "m1", sender: "customer", text: "Halo min, apakah produk Essentials Men's Oxford ready?", time: "09:28" },
    { id: "m2", sender: "admin", text: "Halo Kak Farhan! Ready kak, silakan diorder ya.", time: "09:29" },
    { id: "m3", sender: "customer", text: "Oke min langsung saya order ya. Makasih!", time: "09:30" }
  ],
  "2": [
    { id: "m4", sender: "customer", text: "Tolong kirim hari ini ya kak.", time: "Kemarin 14:10" },
    { id: "m5", sender: "admin", text: "Baik kak, pesanan sedang kami proses.", time: "Kemarin 14:15" },
    { id: "m6", sender: "customer", text: "Sudah saya bayar ya kak, tolong diproses", time: "Kemarin 14:30" }
  ],
  "3": [
    { id: "m7", sender: "customer", text: "Bisa kirim pakai Grab Sameday?", time: "08:15" }
  ],
  "4": [
    { id: "m8", sender: "customer", text: "Halo kak, ukuran M untuk kaos warna putih masih ada?", time: "07:50" },
    { id: "m9", sender: "customer", text: "Ukuran M masih ada kak?", time: "07:55" }
  ],
  "5": [
    { id: "m10", sender: "customer", text: "Halo min, saya sudah order kemarin.", time: "Kemarin 10:00" },
    { id: "m11", sender: "admin", text: "Halo Kak Reza, pesanan sedang dikemas ya.", time: "Kemarin 10:05" },
    { id: "m12", sender: "customer", text: "Tolong cek resi saya ya min", time: "Kemarin 13:30" }
  ],
  "6": [
    { id: "m13", sender: "customer", text: "Halo kak, produk yang kemarin sudah habis ya?", time: "Senin 09:00" },
    { id: "m14", sender: "admin", text: "Iya kak Nurul, stok sedang habis.", time: "Senin 09:10" },
    { id: "m15", sender: "customer", text: "Kapan restock warna hitamnya?", time: "Senin 09:15" }
  ],
  "7": [
    { id: "m16", sender: "customer", text: "Halo min selamat pagi!", time: "Senin 08:00" },
    { id: "m17", sender: "customer", text: "Min ada diskon tidak bulan ini?", time: "Senin 08:05" }
  ],
  "8": [
    { id: "m18", sender: "customer", text: "Halo admin, saya order 3 hari lalu.", time: "Minggu 15:00" },
    { id: "m19", sender: "customer", text: "Pesanan saya belum sampai min", time: "Minggu 17:30" }
  ],
  "9": [
    { id: "m20", sender: "customer", text: "Apakah bisa COD area Bandung?", time: "Minggu 11:00" }
  ],
  "10": [
    { id: "m21", sender: "customer", text: "Halo min, saya tertarik dengan produknya.", time: "Sabtu 14:00" },
    { id: "m22", sender: "admin", text: "Halo Kak Maya, dengan senang hati kami bantu!", time: "Sabtu 14:10" },
    { id: "m23", sender: "customer", text: "Boleh minta foto produknya lebih?", time: "Sabtu 14:15" }
  ],
  "11": [
    { id: "m24", sender: "admin", text: "Selamat siang Kak Tono, ada yang bisa kami bantu?", time: "Sabtu 10:00" },
    { id: "m25", sender: "customer", text: "Tadi paket sudah sampai kak.", time: "Sabtu 12:30" },
    { id: "m26", sender: "customer", text: "Paket sudah diterima, terima kasih!", time: "Sabtu 12:31" }
  ],
  "12": [
    { id: "m27", sender: "customer", text: "Halo kak, saya mau tanya soal produk.", time: "Jumat 09:00" },
    { id: "m28", sender: "customer", text: "Apakah ada garansi produknya kak?", time: "Jumat 09:05" }
  ],
  "13": [
    { id: "m29", sender: "customer", text: "Selamat sore min.", time: "Jumat 15:00" },
    { id: "m30", sender: "customer", text: "Mau tanya stok celana panjangnya kak", time: "Jumat 15:02" }
  ]
};

interface ChatDetailPanelProps {
  chatId: string;
  mode: "page" | "panel";
  onBack?: () => void;
}

export const ChatDetailPanel: React.FC<ChatDetailPanelProps> = ({ chatId, mode, onBack }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const partner = initialChats.find(c => c.id === chatId) ?? { name: "Pengguna", verified: false };

  // Load messages from hardcoded initial state (resets on every refresh)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(initialMessages[chatId] ?? []);
    }, 0);
    return () => clearTimeout(timer);
  }, [chatId]);

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

      // Hide scrollbar unless it reaches max height (120px)
      if (textarea.scrollHeight > 120) {
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.overflowY = "hidden";
      }
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const timeString = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":");
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      text: inputText,
      time: timeString
    };

    const updated = [...messages, newMsg];
    setMessages(updated);

    setInputText("");

    // Trigger mock customer auto-reply
    setTimeout(() => {
      const autoMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "customer",
        text: "Baik min, terima kasih banyak atas respon cepatnya! 👍",
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":")
      };
      setMessages(prev => [...prev, autoMsg]);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-950">
      {/* Detail Panel Header */}
      <div className="flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 shrink-0 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {mode === "page" && (
            <button 
              onClick={() => {
                if (onBack) onBack();
                else router.push("/admin/chat");
              }}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 mr-1"
              title="Kembali"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(partner.name)}`} 
              alt={partner.name} 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex flex-col justify-center h-9">
            <span className="font-semibold text-sm leading-none truncate text-zinc-900 dark:text-zinc-100">
              {partner.name}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] leading-none text-zinc-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 thin-scroll">
        {messages.map((msg) => {
          const isAdmin = msg.sender === "admin";
          return (
            <div
              key={msg.id}
              className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
            >
              {msg.product ? (
                <Link 
                  href={`/product/${msg.product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-2.5 flex gap-3 w-[260px] text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={msg.product.imageUrl} 
                    alt={msg.product.name} 
                    className="w-12 h-12 rounded-sm object-cover bg-white dark:bg-zinc-950 shrink-0" 
                  />
                  <div className="flex flex-col min-w-0 justify-between">
                    <div>
                      <h5 className="text-[11px] font-semibold text-zinc-850 dark:text-zinc-200 truncate leading-tight" title={msg.product.name}>
                        {msg.product.name}
                      </h5>
                      {msg.product.variant && (
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Varian: {msg.product.variant}
                        </p>
                      )}
                    </div>
                    <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mt-1">
                      Rp{msg.product.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                </Link>
              ) : isAdmin ? (
                <div className="flex items-start max-w-[70%] justify-end">
                  <div className="bg-emerald-200 text-zinc-950 rounded-l-xl rounded-b-xl px-4 py-2.5 text-sm">
                    <p className="leading-relaxed break-words">{msg.text}</p>
                    <span className="text-[9px] block text-right mt-1.5 text-zinc-600">
                      {msg.time}
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
                      {msg.time}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-700 hover:bg-sky-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer mb-0.5"
            title="Kirim"
          >
            <FiSend className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
