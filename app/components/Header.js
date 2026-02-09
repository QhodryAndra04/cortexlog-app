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
      // Implement search functionality
      console.log('Search:', searchQuery, 'Time Range:', timeRange);
    }
  }, [searchQuery, timeRange]);

  return (
    <>
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          {/* Left: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-400 hover:text-white transition flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-400 overflow-auto">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                  {crumb.current ? (
                    <span className="text-blue-400 font-medium">{crumb.label}</span>
                  ) : (
                    <>
                      <a 
                        href={crumb.href} 
                        className="hover:text-slate-300 transition"
                      >
                        {crumb.label}
                      </a>
                      <span>›</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Search, Time Range, Refresh */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Cari IP, ID acara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none w-48"
              />
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="1h">Last 1h</option>
              <option value="24h">Last 24h</option>
              <option value="7d">Last 7d</option>
              <option value="30d">Last 30d</option>
            </select>

            <button 
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`transition p-2 rounded-lg ${isAutoRefresh ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white'}`}
              title="Auto Refresh"
            >
              <svg className={`w-5 h-5 ${isAutoRefresh ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop overlay for sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          style={{ top: '73px' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
