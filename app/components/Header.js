'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('1h');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Function to generate breadcrumbs based on current pathname
  const getBreadcrumbs = () => {
    const breadcrumbMap = {
      '/dashboard': [{ label: 'Beranda', href: '/', current: false }, { label: 'Dashboard', href: '/dashboard', current: true }],
      '/threat-hunting': [{ label: 'Beranda', href: '/', current: false }, { label: 'Pencarian Ancaman', href: '/threat-hunting', current: true }],
      '/user-management': [{ label: 'Beranda', href: '/', current: false }, { label: 'Manajemen Pengguna', href: '/user-management', current: true }],
    };

    return breadcrumbMap[pathname] || [{ label: 'Beranda', href: '/', current: true }];
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSearch = useCallback((e) => {
    if (e.key === 'Enter') {
      console.log('Search:', searchQuery, 'Time Range:', timeRange);
    }
  }, [searchQuery, timeRange]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800" role="banner">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Hamburger + App Icon */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-400 hover:text-white transition flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-800"
              aria-label={isSidebarOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* App Icon / Logo pointing to Dashboard */}
            <a 
              href="/dashboard" 
              className="flex items-center gap-2 group transition-all"
              title="Kembali ke Dashboard"
            >
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20 group-hover:bg-blue-500">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-white font-bold tracking-tight text-lg hidden sm:block">
                CortexLog
              </span>
            </a>
          </div>

          {/* Right: Empty (Minimalist) */}
          <div className="flex items-center gap-4">
            {/* Anda bisa menambahkan profil user di sini nanti jika diperlukan */}
          </div>
        </div>
      </header>

      {/* Backdrop overlay for sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          style={{ top: '73px' }}
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
