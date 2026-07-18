export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  status: "Belum Dibayar" | "Sedang Diproses" | "Dikirim" | "Selesai" | "Dibatalkan";
  date: string;
  items: OrderItem[];
  address: string;
  voucherCode?: string;
  discount?: number;
}

export const STATUS_STEPS: { value: Order["status"]; label: string }[] = [
  { value: "Belum Dibayar", label: "Belum Dibayar" },
  { value: "Sedang Diproses", label: "Sedang Diproses" },
  { value: "Dikirim", label: "Dikirim" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

export const PAYMENT_METHOD_OPTIONS = [
  "-",
  "Transfer BCA",
  "Transfer Bank Mandiri",
  "GoPay",
  "ShopeePay",
  "OVO",
  "COD"
];
