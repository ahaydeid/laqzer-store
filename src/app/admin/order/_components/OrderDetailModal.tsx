import React from "react";
import { FiEdit2 } from "react-icons/fi";
import { Order } from "./types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (order: Order) => void;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onOpenEdit,
}: OrderDetailModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        order ? (
          <span>
            Detail Pesanan #{order.id}
          </span>
        ) : undefined
      }
      size="lg"
      panelClassName="animate-in fade-in zoom-in-95 duration-150"
      footer={
        order ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="rounded"
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenEdit(order)}
              className="rounded"
            >
              <FiEdit2 className="h-3.5 w-3.5" />
              Edit Status
            </Button>
          </div>
        ) : undefined
      }
    >
      {order && (
        <div className="p-6 space-y-4">
          <div className="text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">Nama Pelanggan:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Tanggal Transaksi:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{order.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Metode Pembayaran:</span>
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Status:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-normal ${
                  order.status === "Selesai"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : order.status === "Sedang Diproses"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                    : order.status === "Belum Dibayar"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                    : order.status === "Dikirim"
                    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400"
                    : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <span className="text-zinc-400">Alamat Pengiriman:</span>
              <span className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded border border-zinc-100 dark:border-zinc-800/60 leading-relaxed">
                {order.address}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3">
            <span className="text-xs font-semibold text-zinc-400 block mb-2">Item Belanja</span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-zinc-50 dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800/40">
                  <div>
                    <p className="font-medium text-zinc-800 dark:text-zinc-200">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Rp {item.price.toLocaleString("id-ID")} x {item.quantity}</p>
                  </div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Voucher & Total */}
          <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 space-y-2">
            {order.voucherCode && order.discount ? (
              <>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Subtotal:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    Rp {order.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    Voucher
                    <span className="font-mono font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30 text-[10px]">
                      {order.voucherCode}
                    </span>
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    -Rp {order.discount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-900 pt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Total Pembayaran:</span>
                  <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                    Rp {order.total.toLocaleString("id-ID")}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Total Pembayaran:</span>
                <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                  Rp {order.total.toLocaleString("id-ID")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
