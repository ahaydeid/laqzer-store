"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiX, FiShoppingBag, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { ActionButton } from "@/components/ui/ActionButton";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  status: "Belum Dibayar" | "Sedang Diproses" | "Dikirim" | "Selesai" | "Dibatalkan";
  date: string;
  items: OrderItem[];
  address: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: "20260003",
    customerName: "Farhan Maulana",
    total: 179000,
    paymentMethod: "Transfer Bank Mandiri",
    status: "Selesai",
    date: "13 Jul 2026",
    address: "Jl. Diponegoro No. 123, Bandung, Jawa Barat",
    items: [
      { name: "Essentials Men's Oxford Shirt", price: 179000, quantity: 1 }
    ]
  },
  {
    id: "20260002",
    customerName: "Siti Rahma",
    total: 198000,
    paymentMethod: "GoPay",
    status: "Sedang Diproses",
    date: "12 Jul 2026",
    address: "Sudirman Mansion Lt. 15, Kebayoran Baru, Jakarta Selatan",
    items: [
      { name: "Classic Leather Belt", price: 198000, quantity: 1 }
    ]
  },
  {
    id: "20260001",
    customerName: "Andi Wijaya",
    total: 650000,
    paymentMethod: "ShopeePay",
    status: "Selesai",
    date: "11 Jul 2026",
    address: "Perumahan Indah Permai Blok C/4, Surabaya, Jawa Timur",
    items: [
      { name: "Minimalist Running Shoes", price: 650000, quantity: 1 }
    ]
  },
  {
    id: "20260004",
    customerName: "Dewi Kusuma",
    total: 320000,
    paymentMethod: "OVO",
    status: "Belum Dibayar",
    date: "10 Jul 2026",
    address: "Jl. Malioboro No. 45, Yogyakarta, DIY",
    items: [
      { name: "Waterproof Backpack", price: 320000, quantity: 1 }
    ]
  },
  {
    id: "20260005",
    customerName: "Reza Pratama",
    total: 150000,
    paymentMethod: "Transfer BCA",
    status: "Dikirim",
    date: "09 Jul 2026",
    address: "Komp. Permai Jaya No. 7, Medan, Sumatera Utara",
    items: [
      { name: "Casual Cotton Tee", price: 75000, quantity: 2 }
    ]
  },
  {
    id: "20260006",
    customerName: "Nurul Hidayah",
    total: 450000,
    paymentMethod: "COD",
    status: "Dibatalkan",
    date: "08 Jul 2026",
    address: "Jl. Gajah Mada No. 88, Semarang, Jawa Tengah",
    items: [
      { name: "Wool Knit Sweater", price: 450000, quantity: 1 }
    ]
  }
];

export default function OrderPage() {
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = "Kelola Pesanan | Laqzer Admin";
  }, []);

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
                onClick={() => { setStatusFilter(tab); setCurrentPage(1); }}
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
            onChange={(e) => { setSearchValue(e.target.value); setCurrentPage(1); }}
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
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell scope="col" className="text-center w-12 whitespace-nowrap">No</TableHeaderCell>
            <TableHeaderCell scope="col" className="whitespace-nowrap">ID Pesanan</TableHeaderCell>
            <TableHeaderCell scope="col" className="whitespace-nowrap">Nama Pelanggan</TableHeaderCell>
            <TableHeaderCell scope="col" className="whitespace-nowrap">Tanggal</TableHeaderCell>
            <TableHeaderCell scope="col" className="whitespace-nowrap">Total Belanja</TableHeaderCell>
            <TableHeaderCell scope="col" className="whitespace-nowrap">Metode</TableHeaderCell>
            <TableHeaderCell scope="col" className="whitespace-nowrap">Status</TableHeaderCell>
            <TableHeaderCell scope="col" className="text-center w-20 min-w-20 whitespace-nowrap sticky right-0 bg-zinc-50 dark:bg-zinc-900 z-20 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">Aksi</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {displayedOrders.length > 0 ? (
            displayedOrders.map((order, index) => (
              <TableRow
                key={order.id}
                className="group"
              >
                <TableCell className="text-center text-zinc-400 dark:text-zinc-500 w-12 font-medium whitespace-nowrap">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>
                <TableCell className="text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  {order.id}
                </TableCell>
                <TableCell className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(order.customerName)}`}
                      alt={order.customerName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {order.customerName}
                </TableCell>
                <TableCell className="whitespace-nowrap">{order.date}</TableCell>
                <TableCell className="text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                  Rp {order.total.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="whitespace-nowrap">{order.paymentMethod}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-normal ${
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
                </TableCell>
                <TableCell className="text-center w-20 min-w-20 whitespace-nowrap sticky right-0 bg-white dark:bg-zinc-900 group-even:bg-zinc-50 dark:group-even:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.25)] transition-colors duration-200 z-10">
                  <div className="flex items-center justify-center">
                    <ActionButton
                      variant="detail"
                      onClick={() => setSelectedOrder(order)}
                      title="Detail Pesanan"
                    >
                      <FiEye className="h-4 w-4" />
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-zinc-400">
                Tidak ada pesanan ditemukan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls (Outside Table Card) */}
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

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          selectedOrder ? (
            <span className="flex items-center gap-2">
              <FiShoppingBag className="text-sky-500 h-5 w-5" />
              Detail Pesanan {selectedOrder.id}
            </span>
          ) : undefined
        }
        size="lg"
        panelClassName="animate-in fade-in zoom-in-95 duration-150"
      >
        {selectedOrder && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-zinc-400 -mt-2">{selectedOrder.date}</p>

            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Nama Pelanggan:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Metode Pembayaran:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{selectedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-normal ${
                    selectedOrder.status === "Selesai"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : selectedOrder.status === "Sedang Diproses"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                      : selectedOrder.status === "Belum Dibayar"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                      : selectedOrder.status === "Dikirim"
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400"
                      : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-zinc-400">Alamat Pengiriman:</span>
                <span className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded border border-zinc-100 dark:border-zinc-800/60 leading-relaxed">
                  {selectedOrder.address}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3">
              <span className="text-xs font-semibold text-zinc-400 block mb-2">Item Belanja</span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedOrder.items.map((item, idx) => (
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

            {/* Total */}
            <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Total Pembayaran:</span>
              <span className="text-base font-bold text-sky-600 dark:text-sky-400">
                Rp {selectedOrder.total.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
