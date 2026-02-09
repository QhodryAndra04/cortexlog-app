"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "/login";
  };

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "📊",
    },
    {
      label: "Pencarian Ancaman",
      href: "/threat-hunting",
      icon: "🎯",
    },
    {
      label: "Manajemen Pengguna",
      href: "/user-management",
      icon: "👤",
    },
  ];

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-700 text-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: "64px", backgroundColor: "#151719" }}
      >
        {/* Sidebar Header - Wazuh Style */}
        <div className="p-4 border-b border-slate-700 flex-shrink-0 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/30 p-2.5 rounded-md border border-blue-600/50">
              <span className="text-xl">🔒</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-wide">
                CORTEXLOG
              </h2>
              <p className="text-xs text-blue-400 font-semibold">
                Anomaly Detection
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Menu Items - Wazuh Style */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 group border-l-2 ${
                    isActive
                      ? "bg-blue-600/15 border-l-blue-600 border-slate-700"
                      : "bg-transparent border-l-transparent border-slate-700 hover:bg-slate-800/50 hover:border-l-blue-600"
                  }`}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-semibold text-sm leading-tight transition-colors ${
                        isActive
                          ? "text-blue-300"
                          : "text-slate-300 group-hover:text-slate-100"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div
                      className={`text-xs mt-0.5 leading-tight transition-colors ${
                        isActive
                          ? "text-blue-400/80"
                          : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0 mt-1"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button - Wazuh Style */}
        <div className="p-3 border-t border-slate-700 flex-shrink-0">
          <button
            onClick={() => {
              handleLogout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-all duration-200 font-semibold text-white text-sm"
          >
            <span>🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
