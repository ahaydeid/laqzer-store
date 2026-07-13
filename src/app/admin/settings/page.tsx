'use client'

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FiMessageSquare, FiVolume2, FiChevronLeft } from "react-icons/fi";

import { SidebarMenu } from "./components/SidebarMenu";
import { SuaraNotifikasiTab } from "./components/SuaraNotifikasiTab";

// Placeholder tab component
const PlaceholderTab: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
      <FiMessageSquare className="w-5 h-5 text-zinc-400" />
    </div>
    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
      Pengaturan <span className="text-zinc-700 dark:text-zinc-200 font-semibold">{title}</span> segera hadir
    </p>
  </div>
);

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("pesan");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const showSuccessBanner = (title: string, text: string) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "success",
      timer: 3000,
      showConfirmButton: false,
    });
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setShowMobileDetail(true);
  };

  const trimToWord = (text: string, max: number) => {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  };

  const menuItems = [
    {
      id: "pesan" as const,
      title: "Pesan",
      subtitle: "Atur preferensi notifikasi pesan masuk dari pelanggan",
      icon: FiMessageSquare,
    },
    {
      id: "notifikasi" as const,
      title: "Notifikasi Aplikasi",
      subtitle: "Atur preferensi suara notifikasi pesanan masuk dan stok",
      icon: FiVolume2,
    },
  ];

  return (
    <div className="select-none space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 h-8">
        {showMobileDetail && (
          <button
            onClick={() => setShowMobileDetail(false)}
            className="md:hidden p-1 -ml-1 text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer outline-none active:scale-95 flex items-center justify-center"
          >
            <FiChevronLeft className="w-6 h-6 shrink-0" />
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
      </div>

      {/* Content Area */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left Column - Sidebar Menu */}
        <div className={`${showMobileDetail ? "hidden" : "block"} md:block w-full md:w-80 flex-shrink-0`}>
          <SidebarMenu
            activeTab={activeTab}
            setActiveTab={handleSelectTab}
            menuItems={menuItems}
            trimToWord={trimToWord}
            showActive={!isMobile || showMobileDetail}
          />
        </div>

        {/* Right Column - Tab Content */}
        <div className={`flex-1 w-full ${showMobileDetail ? "block" : "hidden"} md:block`}>
          <div className="bg-white dark:bg-zinc-900 p-5 md:p-6">
            {activeTab === "pesan" && (
              <PlaceholderTab title="Pesan" />
            )}

            {activeTab === "notifikasi" && (
              <SuaraNotifikasiTab
                onShowSuccessAlert={showSuccessBanner}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
