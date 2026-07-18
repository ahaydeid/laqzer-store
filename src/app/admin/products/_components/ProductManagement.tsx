"use client";

import React, { useState } from "react";
import { 
  FiPlus, 
  FiMinus, 
  FiSave, 
  FiEdit3, 
  FiTrash2, 
  FiChevronLeft, 
  FiChevronRight, 
  FiX, 
  FiBox, 
  FiAlertTriangle, 
  FiXCircle,
  FiEye
} from "react-icons/fi";
import Swal from "sweetalert2";
import { Product } from "@/core/types/product";
import { Category } from "@/core/types/category";
import { AdminSearchFilter } from "./AdminSearchFilter";
import { ProductFormModal } from "./ProductFormModal";
import { ProductDetailModal } from "./ProductDetailModal";
import { playSwalSound } from "@/utils/sound";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { ActionButton } from "@/components/ui/ActionButton";
import { Button } from "@/components/ui/Button";

import { getServices } from "@/services";

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'shirt', name: 'Kemeja', iconName: 'Shirt' },
  { id: 't-shirt', name: 'T-Shirt', iconName: 'Shirt' },
  { id: 'jacket', name: 'Jaket', iconName: 'Jacket' },
  { id: 'shoes', name: 'Sepatu', iconName: 'Shoes' },
  { id: 'bag', name: 'Tas', iconName: 'Bag' },
  { id: 'cap', name: 'Topi', iconName: 'Cap' },
  { id: 'jeans', name: 'Jeans', iconName: 'Jeans' },
  { id: 'watches', name: 'Jam Tangan', iconName: 'Watch' },
]

interface ProductManagementProps {
  initialProducts: Product[];
  categories?: Category[];
}

export function ProductManagement({ initialProducts, categories = DEFAULT_CATEGORIES }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Modal state (Create & Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);

  // Track draft stock values in a key-value object { [productId]: stockValue }
  const [draftStocks, setDraftStocks] = useState<Record<string, number>>(() => {
    const initialDrafts: Record<string, number> = {};
    initialProducts.forEach(p => {
      initialDrafts[p.id] = p.stock;
    });
    return initialDrafts;
  });

  const handleStartEdit = (productId: string, currentStock: number) => {
    setEditingProductId(productId);
    setDraftStocks(prev => ({
      ...prev,
      [productId]: currentStock
    }));
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const handleStockChange = (productId: string, val: number) => {
    if (val < 0) return;
    setDraftStocks(prev => ({
      ...prev,
      [productId]: val
    }));
  };

  const handleSaveStock = async (productId: string, name: string) => {
    const newStock = draftStocks[productId] ?? 0;
    try {
      const productService = getServices().products;
      await productService.updateProduct(productId, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      setEditingProductId(null);
      
      playSwalSound("success");
      
      Swal.fire({
        title: 'Berhasil!',
        text: `Stok "${name}" berhasil diubah menjadi ${newStock} pcs`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        title: 'Gagal!',
        text: err.message || 'Gagal memperbarui stok di Supabase',
        icon: 'error',
      });
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    playSwalSound("confirm");
    Swal.fire({
      title: 'Hapus Produk?',
      text: `Apakah kamu yakin ingin menghapus produk "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#71717a',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const productService = getServices().products;
          await productService.deleteProduct(id);
          setProducts(prev => prev.filter(p => p.id !== id));
          playSwalSound("success");
          Swal.fire({
            title: 'Berhasil!',
            text: `Produk "${name}" berhasil dihapus dari Supabase!`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err: any) {
          console.error(err);
          Swal.fire({
            title: 'Gagal!',
            text: err.message || 'Gagal menghapus produk dari Supabase',
            icon: 'error',
          });
        }
      }
    });
  };

  // Open Form Modal for Creating new Product
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Editing existing Product
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  // Open Detail Modal for viewing Product Info
  const handleOpenDetailModal = (product: Product) => {
    setSelectedDetailProduct(product);
    setIsDetailModalOpen(true);
  };

  // Handle saving product from Form Modal
  const handleSaveProduct = async (savedData: Partial<Product>) => {
    try {
      const productService = getServices().products;
      if (savedData.id) {
        // Update existing product
        const updated = await productService.updateProduct(savedData.id, savedData);
        setProducts(prev =>
          prev.map(p => (p.id === savedData.id ? updated : p))
        );
      } else {
        // Create new product
        const created = await productService.createProduct(savedData);
        setProducts(prev => [created, ...prev]);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        title: 'Gagal!',
        text: err.message || 'Gagal menyimpan produk ke Supabase',
        icon: 'error',
      });
    }
  };

  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

  const getCategoryName = (catId: string) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.name : catId;
  };

  return (
    <div className="space-y-6">
      {/* KARTU STATISTIK STOK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Unit Stok */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-sky-100/80 dark:bg-sky-900/30 flex items-center justify-center text-white pointer-events-none">
            <FiBox className="w-14 h-14 translate-x-10 translate-y-10" />
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Total Unit Stok
            </h3>
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 block">
              {totalStock}{" "}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                pcs
              </span>
            </span>
          </div>
        </div>

        {/* Stok Menipis */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center text-white pointer-events-none">
            <FiAlertTriangle className="w-14 h-14 translate-x-10 translate-y-10" />
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Stok Menipis (≤ 5)
            </h3>
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 block">
              {lowStock}{" "}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                produk
              </span>
            </span>
          </div>
        </div>

        {/* Stok Habis */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800/80 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col justify-end relative overflow-hidden h-28">
          <div className="absolute -top-24 -left-24 w-56 h-56 rounded-full bg-rose-100/80 dark:bg-rose-900/30 flex items-center justify-center text-white pointer-events-none">
            <FiXCircle className="w-14 h-14 translate-x-10 translate-y-10" />
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Stok Habis
            </h3>
            <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 block">
              {outOfStock}{" "}
              <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">
                produk
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* HEADER & AKSI */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Kelola Produk</h1>
        </div>
        <div>
          <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
            <FiPlus className="h-4 w-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <AdminSearchFilter />

      {/* TABEL KATALOG UTAMA */}
      <div className="space-y-4">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell scope="col" className="text-center w-12">No</TableHeaderCell>
              <TableHeaderCell scope="col">Produk</TableHeaderCell>
              <TableHeaderCell scope="col">Kategori</TableHeaderCell>
              <TableHeaderCell scope="col">Harga</TableHeaderCell>
              <TableHeaderCell scope="col" className="w-64">Stok</TableHeaderCell>
              <TableHeaderCell scope="col" className="text-center w-32">Aksi</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {products.map((product, index) => {
              const isEditing = editingProductId === product.id;
              const draftVal = draftStocks[product.id] ?? product.stock;

              return (
                <TableRow key={product.id}>
                  {/* No */}
                  <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs w-12 font-medium text-center">
                    {index + 1}
                  </TableCell>

                  {/* Info Produk */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl || '/img/placeholder.jpg'}
                        alt={product.name}
                        className="h-9 w-9 rounded-lg object-cover bg-zinc-50 dark:bg-zinc-900 flex-shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {product.name}
                        </span>
                        {product.isCampaign && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                            Campaign Promo
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Kategori */}
                  <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs">
                    {getCategoryName(product.category)}
                  </TableCell>

                  {/* Harga */}
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </TableCell>

                  {/* Stok (Unified Column) */}
                  <TableCell>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        {/* Adjuster */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50">
                          <button
                            type="button"
                            onClick={() => handleStockChange(product.id, draftVal - 1)}
                            className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
                          >
                            <FiMinus className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={draftVal}
                            onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                            className="w-12 text-center text-xs font-semibold bg-transparent outline-none border-x border-zinc-200 dark:border-zinc-800 py-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleStockChange(product.id, draftVal + 1)}
                            className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
                          >
                            <FiPlus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Batal */}
                        <ActionButton
                          variant="detail"
                          title="Batal"
                          onClick={handleCancelEdit}
                          className="cursor-pointer"
                        >
                          <FiX className="h-4 w-4" />
                        </ActionButton>

                        {/* Simpan */}
                        <ActionButton
                          variant="edit"
                          title="Simpan"
                          onClick={() => handleSaveStock(product.id, product.name)}
                          className="cursor-pointer"
                        >
                          <FiSave className="h-4 w-4 text-white" />
                        </ActionButton>
                      </div>
                    ) : (
                      <div className="flex items-center justify-start gap-2.5">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {product.stock > 0 ? (
                            <span>
                              {product.stock}{" "}
                              <span className="font-normal text-zinc-400 dark:text-zinc-500">
                                pcs
                              </span>
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold">Habis</span>
                          )}
                        </span>
                        
                        <ActionButton
                          variant="detail"
                          title="Edit Stok"
                          onClick={() => handleStartEdit(product.id, product.stock)}
                          className="cursor-pointer"
                        >
                          <FiEdit3 className="h-4 w-4" />
                        </ActionButton>
                      </div>
                    )}
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Lihat Detail */}
                      <ActionButton
                        variant="detail"
                        onClick={() => handleOpenDetailModal(product)}
                        title="Lihat Detail Produk"
                        className="cursor-pointer"
                      >
                        <FiEye className="h-4 w-4" />
                      </ActionButton>

                      {/* Edit Detail Produk */}
                      <ActionButton
                        variant="edit"
                        onClick={() => handleOpenEditModal(product)}
                        title="Edit Detail Produk"
                        className="cursor-pointer"
                      >
                        <FiEdit3 className="h-4 w-4 text-white" />
                      </ActionButton>

                      {/* Hapus Produk */}
                      <ActionButton
                        variant="delete"
                        onClick={() => handleDeleteClick(product.id, product.name)}
                        title="Hapus Produk"
                        className="cursor-pointer"
                      >
                        <FiTrash2 className="h-4 w-4 text-white" />
                      </ActionButton>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {products.length === 0 && (
          <div className="p-8 text-center text-zinc-400 text-sm bg-white dark:bg-zinc-900/40 rounded border border-zinc-200/80 dark:border-zinc-800">
            Belum ada data produk di katalog.
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-end gap-2 pr-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer"
            title="Sebelumnya"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded border border-zinc-200/80 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-all dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800/80 cursor-pointer"
            title="Selanjutnya"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* MODAL FORM (CREATE & EDIT) */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        categories={categories}
        initialData={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* MODAL DETAIL PRODUK */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedDetailProduct}
        categoryName={selectedDetailProduct ? getCategoryName(selectedDetailProduct.category) : undefined}
      />
    </div>
  );
}
