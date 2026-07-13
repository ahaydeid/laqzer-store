import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface SuaraNotifikasiTabProps {
  onShowSuccessAlert: (title: string, text: string) => void;
}

// iOS-style Switch component
const Switch: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
}> = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-sky-600 dark:bg-zinc-200" : "bg-zinc-200 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
};

// Custom Toggle for Sound Mode (Normal / Hening)
const SoundModeToggle: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
}> = ({ checked, onChange }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 cursor-pointer select-none w-44"
    >
      {/* Sliding background */}
      <div
        className="absolute top-0.5 bottom-0.5 left-0.5 rounded-md transition-all duration-200 ease-out bg-sky-600 dark:bg-zinc-200"
        style={{
          width: "calc(50% - 2px)",
          transform: checked ? "translateX(0)" : "translateX(100%)",
        }}
      />
      
      {/* Left Option */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(true);
        }}
        className={`flex-1 relative z-10 py-1 font-semibold rounded-md text-center transition-colors duration-200 cursor-pointer text-xs ${
          checked ? "text-white dark:text-zinc-950" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        Normal
      </button>

      {/* Right Option */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onChange(false);
        }}
        className={`flex-1 relative z-10 py-1 font-semibold rounded-md text-center transition-colors duration-200 cursor-pointer text-xs ${
          !checked ? "text-white dark:text-zinc-950" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
        }`}
      >
        Hening
      </button>
    </div>
  );
};

export const SuaraNotifikasiTab: React.FC<SuaraNotifikasiTabProps> = ({
  onShowSuccessAlert,
}) => {
  // Mode Suara: true = Normal, false = Hening
  const [soundMode, setSoundMode] = useState(() => {
    return localStorage.getItem("setting_sound_mode") !== "hening";
  });

  // Notification items for e-commerce
  const [notifOrder, setNotifOrder] = useState(() => localStorage.getItem("notif_order") !== "false");
  const [notifBayar, setNotifBayar] = useState(() => localStorage.getItem("notif_bayar") !== "false");
  const [notifChat, setNotifChat] = useState(() => localStorage.getItem("notif_chat") !== "false");
  const [notifStok, setNotifStok] = useState(() => localStorage.getItem("notif_stok") !== "false");
  const [notifReview, setNotifReview] = useState(() => localStorage.getItem("notif_review") !== "false");

  const [savedSettings, setSavedSettings] = useState({
    soundMode: localStorage.getItem("setting_sound_mode") !== "hening",
    notifOrder: localStorage.getItem("notif_order") !== "false",
    notifBayar: localStorage.getItem("notif_bayar") !== "false",
    notifChat: localStorage.getItem("notif_chat") !== "false",
    notifStok: localStorage.getItem("notif_stok") !== "false",
    notifReview: localStorage.getItem("notif_review") !== "false",
  });

  const isDirty = 
    soundMode !== savedSettings.soundMode ||
    notifOrder !== savedSettings.notifOrder ||
    notifBayar !== savedSettings.notifBayar ||
    notifChat !== savedSettings.notifChat ||
    notifStok !== savedSettings.notifStok ||
    notifReview !== savedSettings.notifReview;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("setting_sound_mode", soundMode ? "normal" : "hening");
    localStorage.setItem("notif_order", notifOrder ? "true" : "false");
    localStorage.setItem("notif_bayar", notifBayar ? "true" : "false");
    localStorage.setItem("notif_chat", notifChat ? "true" : "false");
    localStorage.setItem("notif_stok", notifStok ? "true" : "false");
    localStorage.setItem("notif_review", notifReview ? "true" : "false");

    setSavedSettings({
      soundMode,
      notifOrder,
      notifBayar,
      notifChat,
      notifStok,
      notifReview,
    });

    onShowSuccessAlert(
      "Disimpan!",
      "Preferensi suara dan notifikasi e-commerce berhasil diperbarui."
    );
  };

  const notificationList = [
    { id: "order", label: "Pesanan Baru", desc: "Dapatkan notifikasi instan saat pembeli membuat pesanan baru", state: notifOrder, setter: setNotifOrder },
    { id: "bayar", label: "Konfirmasi Pembayaran", desc: "Dapatkan notifikasi pembayaran sukses/konfirmasi transfer dari pembeli", state: notifBayar, setter: setNotifBayar },
    { id: "chat", label: "Pesan Pelanggan", desc: "Dapatkan notifikasi chat masuk dari calon pembeli", state: notifChat, setter: setNotifChat },
    { id: "stok", label: "Peringatan Stok Menipis", desc: "Beritahu saya saat stok produk kurang dari batas minimum", state: notifStok, setter: setNotifStok },
    { id: "review", label: "Ulasan Produk Baru", desc: "Dapatkan notifikasi ketika pembeli memberikan penilaian produk", state: notifReview, setter: setNotifReview },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-6 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {/* Section 1: Mode Suara */}
        <div className="pt-0 space-y-3">
          <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Mode Suara
          </label>
          <div className="flex flex-col gap-2 py-2">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Mode Suara Aplikasi
            </span>
            <SoundModeToggle
              checked={soundMode}
              onChange={setSoundMode}
            />
          </div>
        </div>

        {/* Section 2: Notifikasi */}
        <div className="pt-5 space-y-3">
          <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Notifikasi Toko
          </label>
          
          <div className="space-y-4 divide-y divide-zinc-100/50 dark:divide-zinc-800/30">
            {notificationList.map((item, idx) => (
              <div 
                key={item.id} 
                className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${idx === 0 ? "pt-0" : "pt-4"}`}
              >
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.label}
                  </span>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    {item.desc}
                  </p>
                </div>
                <div className="pr-2 py-1 flex items-center">
                  <Switch
                    checked={item.state}
                    onChange={item.setter}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save / Cancel buttons */}
      {isDirty && (
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/65 flex justify-end gap-3 animate-in fade-in duration-200">
          <Button
            type="button"
            onClick={() => {
              setSoundMode(savedSettings.soundMode);
              setNotifOrder(savedSettings.notifOrder);
              setNotifBayar(savedSettings.notifBayar);
              setNotifChat(savedSettings.notifChat);
              setNotifStok(savedSettings.notifStok);
              setNotifReview(savedSettings.notifReview);
            }}
            variant="secondary"
            size="sm"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
          >
            Simpan Perubahan
          </Button>
        </div>
      )}
    </form>
  );
};

export default SuaraNotifikasiTab;
