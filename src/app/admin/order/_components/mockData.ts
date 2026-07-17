import { Order } from "./types";

export const INITIAL_ORDERS: Order[] = [
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
      { name: "Classic Leather Belt", price: 218000, quantity: 1 }
    ],
    voucherCode: "FREEONGKIR",
    discount: 20000
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
      { name: "Minimalist Running Shoes", price: 700000, quantity: 1 }
    ],
    voucherCode: "HEMAT50K",
    discount: 50000
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
    total: 135000,
    paymentMethod: "Transfer BCA",
    status: "Dikirim",
    date: "09 Jul 2026",
    address: "Komp. Permai Jaya No. 7, Medan, Sumatera Utara",
    items: [
      { name: "Casual Cotton Tee", price: 75000, quantity: 2 }
    ],
    voucherCode: "LAQZERBARU",
    discount: 15000
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
