import type { Metadata, Viewport } from "next";
import { Lora, Manrope } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "cyrillic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Рибново",
  description: "Аларми, събития и новини от село Рибново",
  applicationName: "Рибново",
  appleWebApp: { capable: true, title: "Рибново", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: "#F3EFE6",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bg" className={`${lora.variable} ${manrope.variable}`}>
      <body className="min-h-dvh antialiased">
        <main className="mx-auto min-h-dvh max-w-md pb-[calc(env(safe-area-inset-bottom)+6rem)]">
          {children}
        </main>
        <BottomNav />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
