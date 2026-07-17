import React from "react";
import { FiCheck } from "react-icons/fi";
import { Order, STATUS_STEPS, PAYMENT_METHOD_OPTIONS } from "./types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface OrderEditModalProps {
  editingOrder: Order | null;
  isOpen: boolean;
  onClose: () => void;
  selectedStatus: Order["status"];
  onChangeStatus: (status: Order["status"]) => void;
  selectedPaymentMethod: string;
  onChangePaymentMethod: (method: string) => void;
  onSave: () => void;
}

export default function OrderEditModal({
  editingOrder,
  isOpen,
  onClose,
  selectedStatus,
  onChangeStatus,
  selectedPaymentMethod,
  onChangePaymentMethod,
  onSave,
}: OrderEditModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingOrder ? (
          <span>
            Edit Pesanan #{editingOrder.id}
          </span>
        ) : undefined
      }
      size="lg"
      panelClassName="animate-in fade-in zoom-in-95 duration-150"
    >
      {editingOrder && (
        <div className="p-6 space-y-5">
          <div className="text-xs space-y-1">
            <span className="text-zinc-400">Pelanggan:</span>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
              {editingOrder.customerName}
            </p>
          </div>

          {/* Metode Pembayaran (Option Select - Positioned AT THE TOP) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Metode Pembayaran
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => onChangePaymentMethod(e.target.value)}
              className="w-full bg-transparent px-0 py-1 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer border-none outline-none"
            >
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <option key={method} value={method} className="dark:bg-zinc-900">
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Step Segmented Toggle Status (Positioned AT THE BOTTOM) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Pilih Tahap Status Baru:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-2 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
              {STATUS_STEPS.map((step) => {
                const isSelected = selectedStatus === step.value;
                return (
                  <button
                    key={step.value}
                    type="button"
                    onClick={() => onChangeStatus(step.value)}
                    className={`flex items-center justify-center py-2.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-sky-600 text-white border-sky-600 shadow-xs font-bold"
                        : "bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <span className="text-center leading-tight text-xs">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="rounded"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              className="rounded"
            >
              <FiCheck className="h-3.5 w-3.5" />
              Simpan
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
