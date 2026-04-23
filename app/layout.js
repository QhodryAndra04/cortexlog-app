import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CortexLog - Dashboard Monitoring Website",
  description:
    "Platform monitoring dan manajemen website yang powerful dan mudah digunakan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-screen w-screen overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen m-0 p-0 overflow-hidden`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Lewati ke konten utama
        </a>
        <div className="h-screen w-screen overflow-y-auto flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
