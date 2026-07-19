import React from "react";
import { FiEye, FiEdit2 } from "react-icons/fi";
import { Order } from "./types";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { ActionButton } from "@/components/ui/ActionButton";
import Avatar from "@/components/ui/Avatar";

interface OrderTableProps {
  displayedOrders: Order[];
  currentPage: number;
  itemsPerPage: number;
  onSelectDetail: (order: Order) => void;
  onOpenEdit: (order: Order) => void;
}

export default function OrderTable({
  displayedOrders,
  currentPage,
  itemsPerPage,
  onSelectDetail,
  onOpenEdit,
}: OrderTableProps) {
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell scope="col" className="text-center w-12 whitespace-nowrap">No</TableHeaderCell>
          <TableHeaderCell scope="col" className="whitespace-nowrap">ID Pesanan</TableHeaderCell>
          <TableHeaderCell scope="col" className="whitespace-nowrap">Status</TableHeaderCell>
          <TableHeaderCell scope="col" className="whitespace-nowrap">Nama Pelanggan</TableHeaderCell>
          <TableHeaderCell scope="col" className="whitespace-nowrap">Tanggal</TableHeaderCell>
          <TableHeaderCell scope="col" className="whitespace-nowrap">Total Belanja</TableHeaderCell>
          <TableHeaderCell scope="col" className="whitespace-nowrap">Voucher</TableHeaderCell>
          <TableHeaderCell scope="col" className="whitespace-nowrap">Metode</TableHeaderCell>
          <TableHeaderCell scope="col" className="text-center w-28 min-w-28 whitespace-nowrap sticky right-0 bg-white dark:bg-zinc-900 z-20 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">Aksi</TableHeaderCell>
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
              <TableCell className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                <Avatar
                  photo={order.customerAvatarUrl}
                  name={order.customerName}
                  size="small"
                  className="border border-zinc-200 dark:border-zinc-700 shrink-0"
                />
                {order.customerName}
              </TableCell>
              <TableCell className="whitespace-nowrap">{order.date}</TableCell>
              <TableCell className="text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                Rp {order.total.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {order.voucherCode ? (
                  <span className="font-mono bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded text-xs">
                    {order.voucherCode}
                  </span>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600 font-medium">-</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">{order.paymentMethod}</TableCell>
              <TableCell className="text-center w-28 min-w-28 whitespace-nowrap sticky right-0 bg-white dark:bg-zinc-900 group-even:bg-zinc-50 dark:group-even:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.25)] transition-colors duration-200 z-10">
                <div className="flex items-center justify-center gap-1.5">
                  <ActionButton
                    variant="detail"
                    onClick={() => onSelectDetail(order)}
                    title="Detail Pesanan"
                  >
                    <FiEye className="h-4 w-4" />
                  </ActionButton>
                  {order.status !== "Selesai" && order.status !== "Dibatalkan" && (
                    <ActionButton
                      variant="edit"
                      onClick={() => onOpenEdit(order)}
                      title="Edit Pesanan"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </ActionButton>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={9} className="py-8 text-center text-zinc-400">
              Belum ada pesanan ditemukan.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
