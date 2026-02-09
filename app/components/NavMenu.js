'use client';

import Link from 'next/link';
import { useState } from 'react';

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
      icon: '📊',
    },
    {
      label: 'List Website',
      href: '/websites',
      icon: '🌐',
    },
    {
      label: 'Tambah Website',
      href: '/websites/add',
      icon: '➕',
    },
  ];

  return (
    <nav className="bg-white rounded-lg shadow">
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-6 py-4 hover:bg-blue-50 border-b-2 border-transparent hover:border-blue-600 transition font-medium text-gray-700 flex items-center gap-2"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="ml-auto px-6 py-4 hover:bg-red-50 border-b-2 border-transparent hover:border-red-600 transition font-medium text-red-600 flex items-center gap-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex items-center justify-between font-medium text-gray-700 hover:bg-blue-50"
        >
          <span>Menu</span>
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {/* Mobile Menu Items */}
        {isOpen && (
          <div className="border-t space-y-1 bg-gray-50">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex px-6 py-3 hover:bg-blue-100 transition text-gray-700 items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full text-left px-6 py-3 hover:bg-red-100 transition text-red-600 flex items-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
