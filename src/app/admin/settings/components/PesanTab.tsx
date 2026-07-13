import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PesanTabProps {
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

export const PesanTab: React.FC<PesanTabProps> = ({ onShowSuccessAlert }) => {
  const defaultReplyActive = true;
  const defaultReplyText = "Halo, terima kasih telah menghubungi toko kami. Pesan Anda telah kami terima dan tim kami akan segera membalasnya.";

  const [replyActive, setReplyActive] = useState(defaultReplyActive);
  const [replyText, setReplyText] = useState(defaultReplyText);

  const [savedSettings, setSavedSettings] = useState({
    replyActive: defaultReplyActive,
    replyText: defaultReplyText,
  });

  const isDirty = replyActive !== savedSettings.replyActive || replyText !== savedSettings.replyText;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings({
      replyActive,
      replyText,
    });
    onShowSuccessAlert(
      "Disimpan!",
      "Template balasan pesan berhasil diperbarui."
    );
  };

  const handleCancel = () => {
    setReplyActive(savedSettings.replyActive);
    setReplyText(savedSettings.replyText);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-6 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {/* Section 1: Template Balasan */}
        <div className="pt-0 space-y-4">
          <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
            Template Balasan Pesan
          </label>
          
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Aktifkan Balasan Otomatis
              </span>
            </div>
            <div className="pr-2 py-1 flex items-center">
              <Switch
                checked={replyActive}
                onChange={setReplyActive}
              />
            </div>
          </div>

          {replyActive && (
            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 block">
                Isi Template Pesan
              </span>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-sky-400 leading-relaxed font-sans transition-colors"
                placeholder="Tulis pesan balasan otomatis di sini..."
                required
              />
            </div>
          )}
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

export default PesanTab;
