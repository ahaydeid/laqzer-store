"use client";

import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiX, FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";
import { playSwalSound } from "@/utils/sound";
import { Order } from "./_components/types";
import OrderTable from "./_components/OrderTable";
import OrderDetailModal from "./_components/OrderDetailModal";
import OrderEditModal from "./_components/OrderEditModal";
import { SupabaseOrderService } from "@/services/supabase/order.service";
import { OrderRecord, OrderStatus } from "@/core/types/order";
import useSWR from "swr";

const DB_STATUS_TO_UI: Record<OrderStatus, Order["status"]> = {
  unpaid: "Belum Dibayar",
  processing: "Sedang Diproses",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const UI_STATUS_TO_DB: Record<Order["status"], OrderStatus> = {
  "Belum Dibayar": "unpaid",
  "Sedang Diproses": "processing",
  "Dikirim": "shipped",
  "Selesai": "completed",
  "Dibatalkan": "cancelled",
};

export default function OrderPage() {
  const orderService = useMemo(() => new SupabaseOrderService(), []);
  
  // Fetch real orders from Supabase using useSWR
  const { data: rawOrders = [], isLoading, mutate } = useSWR<OrderRecord[]>(
    "admin-orders-list",
    () => orderService.getAllOrdersAdmin(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  // Map Supabase OrderRecord to Admin Table UI Order format
  const orders: Order[] = useMemo(() => {
    return rawOrders.map((rec) => ({
      id: rec.orderNumber, // Tampilkan Nomor Invoice unik (misal ORD-20260718-xxxx)
      realDbId: rec.id, // simpan UUID asli untuk update
      customerName: rec.shippingAddress?.recipientName || "Pembeli",
      total: rec.totalAmount,
      paymentMethod: rec.paymentMethod || "-",
      status: DB_STATUS_TO_UI[rec.status] || "Belum Dibayar",
      date: new Date(rec.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      items: (rec.items || []).map((i) => ({
        name: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
      address: `${rec.shippingAddress?.fullAddress || ""}, ${rec.shippingAddress?.subdistrict || ""}, ${rec.shippingAddress?.city || ""}, ${rec.shippingAddress?.province || ""} (${rec.shippingAddress?.phone || ""})`,
      discount: rec.discount,
    }));
  }, [rawOrders]);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrderForStatus, setEditingOrderForStatus] = useState<Order | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState<Order["status"]>("Belum Dibayar");
  const [selectedNewPaymentMethod, setSelectedNewPaymentMethod] = useState<string>("-");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = "Kelola Pesanan | Laqzer Admin";
  }, []);

  const handleOpenEditModal = (order: Order) => {
    setEditingOrderForStatus(order);
    setSelectedNewStatus(order.status);
    setSelectedNewPaymentMethod(order.paymentMethod);
  };

  const handleSaveStatus = async () => {
    if (!editingOrderForStatus) return;

    const realDbId = (editingOrderForStatus as any).realDbId;
    const dbStatus = UI_STATUS_TO_DB[selectedNewStatus];
    const newPaymentMethod = selectedNewPaymentMethod;

    try {
      await Promise.all([
        orderService.updateOrderStatus(realDbId, dbStatus),
        orderService.updatePaymentMethod(realDbId, newPaymentMethod),
      ]);

      playSwalSound("success");
      Swal.fire({
        title: "Berhasil!",
        text: `Data pesanan #${editingOrderForStatus.id} berhasil diperbarui.`,
        icon: "success",
        confirmButtonColor: "#0369a1",
      });

      setEditingOrderForStatus(null);
      mutate();
    } catch (err: any) {
      console.error("Gagal mengupdate pesanan:", err);
      Swal.fire({
        title: "Gagal",
        text: err?.message || "Terjadi kesalahan saat memperbarui pesanan.",
        icon: "error",
        confirmButtonColor: "#0369a1",
      });
    }
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setCurrentPage(1);
  };

  const getTabCount = (tab: string) => {
    if (tab === "Semua") return orders.length;
    return orders.filter((o) => o.status === tab).length;
  };

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.id.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const displayedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kelola Pesanan</h1>
        </div>
      </div>

      {/* Tab Filter (Rata Tengah X) */}
      <div className="flex justify-center border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px pb-1">
          {["Semua", "Belum Dibayar", "Sedang Diproses", "Dikirim", "Selesai", "Dibatalkan"].map((tab) => {
            const isActive = statusFilter === tab;
            const count = getTabCount(tab);
            const getTabClass = () => {
              if (isActive) {
                if (tab === "Selesai") {
                  return "border-sky-500 bg-sky-100/70 text-sky-700 dark:border-sky-400 dark:bg-sky-950/20 dark:text-sky-400";
                }
                if (tab === "Dibatalkan") {
                  return "border-rose-500 bg-rose-100/70 text-rose-700 dark:border-rose-400 dark:bg-rose-950/20 dark:text-rose-400";
                }
                return "border-sky-500 bg-sky-100/70 text-sky-700 dark:border-sky-400 dark:bg-sky-950/20 dark:text-sky-400";
              } else {
                if (tab === "Selesai") {
                  return "border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/20";
                }
                if (tab === "Dibatalkan") {
                  return "border-transparent text-rose-600 hover:text-rose-800 hover:bg-rose-50/30 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/10";
                }
                return "border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/20";
              }
            };

            return (
              <button
                key={tab}
                onClick={() => {
                  setStatusFilter(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-xs whitespace-nowrap cursor-pointer transition-all duration-200 outline-none border-b-2 ${getTabClass()}`}
              >
                {tab}
                {["Belum Dibayar", "Sedang Diproses", "Dikirim"].includes(tab) && ` (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-start">
        <div className="relative shrink-0">
          <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={isFocused ? "Cari ID Pesanan atau Nama..." : "Cari"}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`transition-all duration-300 ease-in-out rounded-full border border-zinc-200 bg-white py-2 pl-10 text-sm outline-none focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900/50 ${
              isFocused ? "w-64 sm:w-80 pr-10" : "w-32 pr-4"
            }`}
          />
          {searchValue && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClearSearch}
              className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors flex items-center justify-center"
              title="Bersihkan Pencarian"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <OrderTable
        displayedOrders={displayedOrders}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onSelectDetail={(order) => setSelectedOrder(order)}
        onOpenEdit={(order) => handleOpenEditModal(order)}
      />

      {/* Pagination Controls */}
      <div className="flex items-center justify-end gap-2 pr-1">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          title="Sebelumnya"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages <= 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          title="Selanjutnya"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder && !editingOrderForStatus}
        onClose={() => setSelectedOrder(null)}
        onOpenEdit={(order) => handleOpenEditModal(order)}
      />

      {/* Edit Modal */}
      <OrderEditModal
        editingOrder={editingOrderForStatus}
        isOpen={!!editingOrderForStatus}
        onClose={() => setEditingOrderForStatus(null)}
        selectedStatus={selectedNewStatus}
        onChangeStatus={setSelectedNewStatus}
        selectedPaymentMethod={selectedNewPaymentMethod}
        onChangePaymentMethod={setSelectedNewPaymentMethod}
        onSave={handleSaveStatus}
      />
    </div>
  );
}
