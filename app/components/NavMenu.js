'use client';

import Link from 'next/link';
import { useState } from 'react';

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
);
const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
);
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);
const ChevronIcon = ({ isOpen }) => (
  <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);

export default function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/login';
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: 'Daftar Website',
      href: '/websites',
      icon: <GlobeIcon />,
    },
    {
      label: 'Tambah Website',
      href: '/websites/add',
      icon: <PlusIcon />,
    },
  ];

  return (
    <nav className="bg-slate-900 border border-slate-700 rounded-lg" role="navigation" aria-label="Menu navigasi">
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-6 py-4 hover:bg-slate-800 border-b-2 border-transparent hover:border-blue-500 transition font-medium text-slate-300 hover:text-white flex items-center gap-2"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="ml-auto px-6 py-4 hover:bg-red-900/30 border-b-2 border-transparent hover:border-red-500 transition font-medium text-red-400 hover:text-red-300 flex items-center gap-2"
        >
          <LogoutIcon />
          <span>Keluar</span>
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between font-medium text-slate-300 hover:bg-slate-800 transition"
          aria-expanded={isOpen}
          aria-controls="nav-mobile-menu"
        >
          <span>Menu</span>
          <ChevronIcon isOpen={isOpen} />
        </button>

        {/* Mobile Menu Items */}
        {isOpen && (
          <div id="nav-mobile-menu" className="border-t border-slate-700 space-y-1 bg-slate-950">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex px-6 py-3 hover:bg-slate-800 transition text-slate-300 hover:text-white items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-6 py-3 hover:bg-red-900/30 transition text-red-400 hover:text-red-300 flex items-center gap-2"
            >
              <LogoutIcon />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
