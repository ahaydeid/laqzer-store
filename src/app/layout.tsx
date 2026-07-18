import type { Metadata } from "next";
import "./globals.css";
import { getServices } from "@/services";
import { ChatWidget } from "@/components/layout/ChatWidget";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Laqzer Store - Official Store Laqzer Indonesia",
  description: "Official Store Laqzer Indonesia Hemat Biaya",
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
        <AuthProvider>
          <CartProvider>
            {children}
            <ChatWidget settings={settings} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

