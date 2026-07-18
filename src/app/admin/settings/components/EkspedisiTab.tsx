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
  const [savedCourierStates, setSavedCourierStates] = useState<Record<string, boolean>>({});

  // State untuk melacak konfigurasi Tier Pengiriman (Reguler, Express, Kargo, Hemat)
  const [tierConfig, setTierConfig] = useState({
    regular: true,
    express: true,
    cargo: false,
    economy: true,
    minCargoWeightGrams: 5000,
  });
  const [savedTierConfig, setSavedTierConfig] = useState({
    regular: true,
    express: true,
    cargo: false,
    economy: true,
    minCargoWeightGrams: 5000,
  });

  // 1. Ambil konfigurasi dari database
  useEffect(() => {
    setLoading(true);
    Promise.all([
      service.getCouriersConfig(),
      service.getShippingTierConfig(),
    ])
      .then(([couriers, tiers]) => {
        setCourierStates(couriers);
        setSavedCourierStates(couriers);
        setTierConfig(tiers);
        setSavedTierConfig(tiers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat konfigurasi ekspedisi:", err);
        setLoading(false);
      });
  }, [service]);

  // Deteksi jika ada perubahan status toggle dibanding data tersimpan
  const isDirty = useMemo(() => {
    const couriersChanged = JSON.stringify(courierStates) !== JSON.stringify(savedCourierStates);
    const tiersChanged = JSON.stringify(tierConfig) !== JSON.stringify(savedTierConfig);
    return couriersChanged || tiersChanged;
  }, [courierStates, savedCourierStates, tierConfig, savedTierConfig]);

  // Batalkan seluruh perubahan
  const handleCancel = () => {
    setCourierStates(savedCourierStates);
    setTierConfig(savedTierConfig);
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
      await Promise.all([
        service.saveCouriersConfig(courierStates),
        service.saveShippingTierConfig(tierConfig),
      ]);

      // Update saved state
      setSavedCourierStates(courierStates);
      setSavedTierConfig(tierConfig);

      // Trigger revalidation cache di home/katalog agar data ter-sync
      fetch('/api/revalidate?path=/').catch((err) =>
        console.error('Failed to trigger products cache revalidation after courier update:', err)
      );

      onShowSuccessAlert(
        "Disimpan!",
        "Konfigurasi ekspedisi dan tier pengiriman berhasil diperbarui."
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

        {/* Tier Pengiriman Controls */}
        <div className="pt-5 space-y-4">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Kategori Tier Pengiriman Toko
            </span>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Batasi jenis/tipe layanan yang ingin Anda terima di checkout (misal matikan Kargo jika tidak bisa mengirim barang besar).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Reguler */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">Layanan Reguler</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">JNE REG, SiCepat REG, J&T EZ, dll.</span>
              </div>
              <Switch
                checked={tierConfig.regular}
                onChange={(val) => setTierConfig(prev => ({ ...prev, regular: val }))}
              />
            </div>

            {/* Express */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">Layanan Express / Next Day</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">JNE YES, SiCepat BEST, Anteraja ND, dll.</span>
              </div>
              <Switch
                checked={tierConfig.express}
                onChange={(val) => setTierConfig(prev => ({ ...prev, express: val }))}
              />
            </div>

            {/* Hemat / Economy */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">Layanan Hemat / Economy</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">JNE OKE, SiCepat HALU, J&T Eco, dll.</span>
              </div>
              <Switch
                checked={tierConfig.economy}
                onChange={(val) => setTierConfig(prev => ({ ...prev, economy: val }))}
              />
            </div>

            {/* Kargo */}
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">Layanan Kargo / Truk</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">JNE JTR, SiCepat GOKIL/Cargo, dll.</span>
              </div>
              <Switch
                checked={tierConfig.cargo}
                onChange={(val) => setTierConfig(prev => ({ ...prev, cargo: val }))}
              />
            </div>
          </div>

          {/* Ambang Batas Berat Kargo */}
          {tierConfig.cargo && (
            <div className="pt-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                Minimal Berat Belanjaan untuk Opsi Kargo (Kilogram)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={tierConfig.minCargoWeightGrams / 1000}
                onChange={(e) => {
                  const kg = Math.max(1, parseInt(e.target.value) || 1);
                  setTierConfig(prev => ({ ...prev, minCargoWeightGrams: kg * 1000 }));
                }}
                className="w-full max-w-xs rounded border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                Opsi Kargo hanya akan ditampilkan jika total berat belanjaan di checkout minimal mencapai angka ini.
              </p>
            </div>
          )}
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
