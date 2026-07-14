import type { Metadata } from "next";
import "./globals.css";
import { getServices } from "@/services";
import { ChatWidget } from "@/components/layout/ChatWidget";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Laqzer Store - UMKM Digital",
  description: "Platform Toko Digital UMKM Indonesia Hemat Biaya",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const services = getServices();
  const settings = await services.store.getSettings();

  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <ChatWidget settings={settings} />
        </CartProvider>
      </body>
    </html>
  );
}

