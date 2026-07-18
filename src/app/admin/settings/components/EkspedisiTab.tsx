import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { FiLoader, FiTruck } from "react-icons/fi";
import { SupabaseShippingSettingsService, ALL_COURIERS } from "@/services/supabase/shipping-settings.service";
import Swal from "sweetalert2";
import { playSwalSound } from "@/utils/sound";

interface EkspedisiTabProps {
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

export const EkspedisiTab: React.FC<EkspedisiTabProps> = ({
  onShowSuccessAlert,
}) => {
  const service = useMemo(() => new SupabaseShippingSettingsService(), []);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State untuk melacak status aktif/nonaktif masing-masing kurir
  const [courierStates, setCourierStates] = useState<Record<string, boolean>>({});
  // State cadangan untuk melacak perubahan (isDirty check)
  const [savedCourierStates, setSavedCourierStates] = useState<Record<string, boolean>>({});

  // 1. Ambil konfigurasi dari database
  useEffect(() => {
    setLoading(true);
    service.getCouriersConfig()
      .then(config => {
        setCourierStates(config);
        setSavedCourierStates(config);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat konfigurasi ekspedisi:", err);
        setLoading(false);
      });
  }, [service]);

  // Deteksi jika ada perubahan status toggle dibanding data tersimpan
  const isDirty = useMemo(() => {
    return JSON.stringify(courierStates) !== JSON.stringify(savedCourierStates);
  }, [courierStates, savedCourierStates]);

  // Batalkan seluruh perubahan
  const handleCancel = () => {
    setCourierStates(savedCourierStates);
  };

  // Simpan konfigurasi kurir ke database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi: minimal harus ada 1 kurir yang aktif
    const activeCount = Object.values(courierStates).filter(Boolean).length;
    if (activeCount === 0) {
      playSwalSound("confirm");
      Swal.fire({
        title: "Gagal Menyimpan",
        text: "Anda harus mengaktifkan minimal 1 jasa ekspedisi untuk pengiriman toko.",
        icon: "warning",
        confirmButtonColor: "#ef4444",
      });
      return;
    }

    setSaving(true);
    try {
      await service.saveCouriersConfig(courierStates);
      
      // Update saved state
      setSavedCourierStates(courierStates);
      
      // Trigger revalidation cache di home/katalog agar data ter-sync
      fetch('/api/revalidate?path=/').catch(err => 
        console.error('Failed to trigger products cache revalidation after courier update:', err)
      );

      onShowSuccessAlert(
        "Disimpan!",
        "Pilihan jasa ekspedisi pengiriman berhasil diperbarui."
      );
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        title: "Gagal Menyimpan",
        text: err.message || "Terjadi kesalahan saat menyimpan pengaturan.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCourier = (id: string, val: boolean) => {
    setCourierStates(prev => ({
      ...prev,
      [id]: val
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <FiLoader className="h-8 w-8 animate-spin mb-3 opacity-60" />
        <p className="text-sm">Memuat pilihan ekspedisi...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {/* Section Heading */}
        <div className="pt-0 space-y-3">
          <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Jasa Ekspedisi RajaOngkir
          </label>
          <div className="flex items-center gap-3 py-1">
            <FiTruck className="w-5 h-5 text-sky-600 dark:text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Konfigurasi Ekspedisi Pengiriman Aktif
            </span>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Aktifkan kurir pengiriman yang ingin Anda sediakan untuk pembeli di halaman checkout toko Anda.
          </p>
        </div>

        {/* Courier Toggles List */}
        <div className="pt-5 space-y-3">
          <div className="space-y-4 divide-y divide-zinc-100/50 dark:divide-zinc-800/30">
            {ALL_COURIERS.map((courier, idx) => {
              const isActive = !!courierStates[courier.id];
              return (
                <div 
                  key={courier.id} 
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${idx === 0 ? "pt-0" : "pt-4"}`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {courier.name}
                    </span>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {courier.desc}
                    </p>
                  </div>
                  <div className="pr-2 py-1 flex items-center">
                    <Switch
                      checked={isActive}
                      onChange={(val) => handleToggleCourier(courier.id, val)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save / Cancel buttons */}
      {isDirty && (
        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/65 flex justify-end gap-3 animate-in fade-in duration-200">
          <Button
            type="button"
            onClick={handleCancel}
            variant="secondary"
            size="sm"
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      )}
    </form>
  );
};
