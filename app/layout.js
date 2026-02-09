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
    <html lang="en" className="h-screen w-screen overflow-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen m-0 p-0 overflow-hidden`}
      >
        <div className="h-screen w-screen overflow-y-auto flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
