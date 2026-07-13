'use client'

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  HiOutlineHome, 
  HiOutlineUser, 
  HiOutlineCog6Tooth, 
  HiOutlineArrowLeftOnRectangle, 
  HiOutlineChevronDown, 
  HiOutlineBars3,
  HiOutlineShoppingBag,
  HiOutlineChatBubbleLeft,
  HiOutlineClipboardDocumentList,
  HiOutlineMegaphone,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const activeTab = pathname === "/admin" 
    ? "beranda" 
    : pathname.startsWith("/admin/products") 
      ? "products" 
      : pathname.startsWith("/admin/chat")
        ? "pesan"
        : pathname.startsWith("/admin/order")
          ? "pesanan"
          : pathname.startsWith("/admin/campaign")
            ? "campaign"
            : pathname.startsWith("/admin/settings")
              ? "pengaturan"
              : "";

  const config = {
    bgDarkClass: "bg-sky-800 dark:bg-zinc-900",
    sidebarTextClass: "text-sky-100 group-hover:text-white dark:text-zinc-400 dark:group-hover:text-zinc-100 transition-colors duration-200",
    sidebarTextActiveColorClass: "text-sky-950 dark:text-sky-400 font-bold",
    sidebarTextActiveBgClass: "bg-zinc-50 dark:bg-zinc-950",
    sidebarBorderClass: "border-sky-800/30 dark:border-zinc-800",
    sidebarProfileHoverClass: "hover:bg-sky-800/60 dark:hover:bg-zinc-800/60",
    sidebarBrandTextClass: "text-white font-bold",
    sidebarSubtextClass: "text-sky-200 dark:text-zinc-500",
    sidebarHoverLineClass: "bg-white/15 dark:bg-zinc-800",
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [profile] = useState({
    name: "Admin Utama",
    email: "admin@laqzer.com"
  });

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOrderCount] = useState(2);

  useEffect(() => {
    const calcUnread = () => {
      const stored = localStorage.getItem("chat_list");
      if (stored) {
        const chats = JSON.parse(stored) as { unreadCount?: number }[];
        const total = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
        setUnreadCount(total > 0 ? total : 3);
      } else {
        setUnreadCount(3); // Default mock unread count
      }
    };

    // Delay initial read to avoid SSR hydration mismatch
    const timer = setTimeout(calcUnread, 0);

    window.addEventListener("chat_updated", calcUnread);
    window.addEventListener("storage", calcUnread);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("chat_updated", calcUnread);
      window.removeEventListener("storage", calcUnread);
    };
  }, []);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      router.push("/");
    }
  };

  const menuItems = [
    { type: "item", id: "beranda", label: "Dashboard", href: "/admin", icon: HiOutlineHome },
    { type: "header", label: "Operasional" },
    { type: "item", id: "pesan", label: "Pesan", href: "/admin/chat", icon: HiOutlineChatBubbleLeft },
    { type: "item", id: "pesanan", label: "Pesanan", href: "/admin/order", icon: HiOutlineClipboardDocumentList },
    { type: "item", id: "campaign", label: "Campaign", href: "/admin/campaign", icon: HiOutlineMegaphone },
    { type: "item", id: "products", label: "Produk", href: "/admin/products", icon: HiOutlineShoppingBag },
    { type: "header", label: "Konfigurasi" },
    { type: "item", id: "pengaturan", label: "Pengaturan", href: "/admin/settings", icon: HiOutlineCog6Tooth },
  ];

  const handleItemClick = (item: { href?: string }) => {
    if (item.href) {
      router.push(item.href);
    }
  };
  const getCapsuleClass = (isActive: boolean) => {
    const base = `absolute inset-y-0 right-0 rounded-l-full ${config.sidebarTextActiveBgClass} pointer-events-none z-0`;
    if (isActive) {
      const anim = isCollapsed ? "animate-expand-collapsed" : "animate-expand-expanded";
      return `${base} ${anim} opacity-100`;
    }
    const width = isCollapsed ? "w-[calc(100%-12px)]" : "w-[calc(100%-16px)]";
    return `${base} opacity-0 ${width}`;
  };

  const getMaskClass = (position: "top" | "bottom", isActive: boolean) => {
    const basePos = position === "top" ? "-top-4" : "-bottom-4";
    const base = `absolute ${basePos} right-0 w-4 h-4 bg-zinc-50 dark:bg-zinc-950 pointer-events-none z-10`;
    const transition = isActive ? "opacity-100" : "opacity-0";
    return `${base} ${transition}`;
  };


  const getIconClass = (itemId: string, isActive: boolean) => {
    const base = "h-4.5 w-4.5 shrink-0";
    const color = isActive 
      ? `${config.sidebarTextActiveColorClass} transition-all duration-300` 
      : config.sidebarTextClass;
    
    let scale = "scale-100";
    if (isCollapsed) {
      scale = "scale-[1.22]";
    }
    
    return `${base} ${color} ${scale}`;
  };

  const getSpanClass = (isActive: boolean) => {
    const base = "whitespace-nowrap overflow-hidden font-medium text-sm";
    const color = isActive 
      ? `${config.sidebarTextActiveColorClass} transition-all duration-300` 
      : config.sidebarTextClass;
    const layout = isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-40 opacity-100 ml-3";
    return `${base} ${color} ${layout}`;
  };

  return (
    <aside className={`h-screen sticky top-0 ${config.bgDarkClass} ${config.sidebarTextClass} flex flex-col shrink-0 relative select-none transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      {/* Brand Logo / Action Bar */}
      <div className={`h-16 ${config.bgDarkClass} flex items-center justify-between border-b ${config.sidebarBorderClass} shrink-0 overflow-hidden transition-all duration-300 ${isCollapsed ? "px-4" : "px-5"}`}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`group p-1.5 ${config.sidebarProfileHoverClass} ${config.sidebarTextClass} rounded-full transition-colors cursor-pointer outline-none shrink-0 relative`}
            title={isCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
          >
            <HiOutlineBars3 className={`h-4.5 w-4.5 transition-opacity duration-150 ${isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`} />
            {isCollapsed && (
              <span className="absolute inset-0 flex items-center justify-center rounded-lg opacity-100 group-hover:opacity-0 transition-opacity duration-150 select-none w-8 h-8 m-auto overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/img/logo-laqzer-transparan.png" 
                  alt="L" 
                  className="h-8 w-8 object-contain"
                />
              </span>
            )}
          </button>

          <h1 className={`text-xl font-bold leading-none truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto"}`}>
            <span className={config.sidebarBrandTextClass}>
              Laqzer <span className="text-white/60 dark:text-zinc-500">Admin</span>
            </span>
          </h1>
        </div>
      </div>

      {/* Menu Items List */}
      <nav className="flex-1 flex flex-col gap-1.5 pr-0 py-6 overflow-y-auto scrollbar-none">
        {menuItems.map((item, idx) => {
          if (item.type === "header") {
            return (
              <div
                key={`header-${idx}`}
                className={`px-5 text-[10px] font-bold text-white/50 dark:text-zinc-500 uppercase tracking-widest select-none transition-all duration-300 whitespace-nowrap overflow-hidden
                  ${isCollapsed ? "max-w-0 opacity-0 py-0 h-0" : "max-w-48 opacity-100 pt-3.5 pb-1"}`}
              >
                {item.label}
              </div>
            );
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon!;
          
          return (
            <div
              key={item.id}
              id={`sidebar-item-${item.id}`}
              className="relative w-full group"
            >
              {/* Active expand-capsule background */}
              <div className={getCapsuleClass(isActive)} />

              {/* Top curved mask */}
              <div className={getMaskClass("top", isActive)}>
                <div className={`w-full h-full ${config.bgDarkClass} rounded-br-2xl`}></div>
              </div>

              {/* Main button */}
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center outline-none text-sm cursor-pointer justify-start py-3 pr-5 text-left relative z-10
                  ${isCollapsed ? 'pl-[23px]' : 'pl-8'}`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="relative flex items-center shrink-0">
                  <Icon className={getIconClass(item.id!, isActive)} />
                  {item.id === "pesan" && unreadCount > 0 && isCollapsed && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-bold h-4 w-4 rounded-full flex items-center justify-center z-20 shrink-0">
                      {unreadCount}
                    </span>
                  )}
                  {item.id === "pesanan" && unreadOrderCount > 0 && isCollapsed && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-bold h-4 w-4 rounded-full flex items-center justify-center z-20 shrink-0">
                      {unreadOrderCount}
                    </span>
                  )}
                </div>
                <span className={getSpanClass(isActive)}>
                  {item.label}
                </span>
                {item.id === "pesan" && unreadCount > 0 && !isCollapsed && (
                  <span className="ml-auto bg-rose-500 text-white text-[11px] font-bold h-5 w-5 rounded-full shrink-0 flex items-center justify-center z-20">
                    {unreadCount}
                  </span>
                )}
                {item.id === "pesanan" && unreadOrderCount > 0 && !isCollapsed && (
                  <span className="ml-auto bg-rose-500 text-white text-[11px] font-bold h-5 w-5 rounded-full shrink-0 flex items-center justify-center z-20">
                    {unreadOrderCount}
                  </span>
                )}
              </button>

              {/* Bottom curved mask */}
              <div className={getMaskClass("bottom", isActive)}>
                <div className={`w-full h-full ${config.bgDarkClass} rounded-tr-2xl`}></div>
              </div>

              {/* Hover line indicator (only for inactive item) */}
              <div
                className={`absolute bottom-0 right-0 h-px ${config.sidebarHoverLineClass} transition-all duration-300
                  ${isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"}
                  ${isCollapsed ? 'left-3' : 'left-8'}`}
              />
            </div>
          );
        })}
      </nav>

      {/* Lihat Toko (Separated, Above Footer) */}
      <div className="relative w-full group pb-2 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center outline-none text-sm cursor-pointer justify-start py-3 pr-5 text-left relative z-10
            ${isCollapsed ? 'pl-[23px]' : 'pl-8'} ${config.sidebarTextClass}`}
          title={isCollapsed ? "Lihat Toko" : undefined}
        >
          {isCollapsed ? (
            <HiOutlineArrowTopRightOnSquare className={getIconClass("lihat-toko", false)} />
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="whitespace-nowrap overflow-hidden font-medium text-sm">
                Lihat Toko
              </span>
              <HiOutlineArrowTopRightOnSquare className="h-4 w-4 shrink-0 opacity-80" />
            </div>
          )}
        </a>
        <div
          className={`absolute bottom-2 right-0 h-px ${config.sidebarHoverLineClass} transition-all duration-300 opacity-0 group-hover:opacity-100
            ${isCollapsed ? 'left-3' : 'left-8'}`}
        />
      </div>

      {/* Bottom Profile Section */}
      <div
        ref={profileRef}
        className={`border-t ${config.sidebarBorderClass} pt-4 relative transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-5'}`}
      >
        {/* Dropdown Menu */}
        {isProfileOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-full bottom-2 ml-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-1.5 z-50 text-slate-800 dark:text-zinc-100 flex flex-col gap-0.5"
          >
            <button
              onClick={() => {
                setIsProfileOpen(false);
                alert("Menuju halaman profil... (Simulasi)");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg font-medium cursor-pointer transition-colors outline-none justify-start text-left"
            >
              <HiOutlineUser className="h-4 w-4 shrink-0 text-zinc-500" />
              <span>Profil Saya</span>
            </button>
            <button
              onClick={() => {
                setIsProfileOpen(false);
                alert("Menuju halaman pengaturan... (Simulasi)");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg font-medium cursor-pointer transition-colors outline-none justify-start text-left"
            >
              <HiOutlineCog6Tooth className="h-4 w-4 shrink-0 text-zinc-500" />
              <span>Pengaturan</span>
            </button>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-0.5" />
            <button
              onClick={() => {
                setIsProfileOpen(false);
                handleLogout();
              }}
              className="w-full flex text-red-500 items-center gap-2.5 px-3 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer transition-colors outline-none justify-start text-left"
            >
              <HiOutlineArrowLeftOnRectangle className="h-4 w-4 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        )}

        {/* Profile Trigger Button */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`w-full flex items-center rounded-xl ${config.sidebarProfileHoverClass} active:scale-98 transition-all duration-300 cursor-pointer outline-none justify-between p-2 text-left`}
        >
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-bold text-sm">
              AU
            </div>
            <div className={`min-w-0 flex-1 transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-40 opacity-100 ml-3"}`}>
              <p className={`text-sm font-medium truncate text-white leading-tight`} title={profile.name}>
                {profile.name}
              </p>
              <p className={`text-[10px] ${config.sidebarSubtextClass} font-medium truncate`} title={profile.email}>
                {profile.email}
              </p>
            </div>
          </div>
          <HiOutlineChevronDown className={`h-4 w-4 ${config.sidebarSubtextClass} shrink-0 transition-all duration-300 ${isCollapsed ? 'max-w-0 opacity-0 scale-75' : 'max-w-4 opacity-100 scale-100'} ${isProfileOpen ? '-rotate-90' : ''}`} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
