'use client';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#202428]">
      <div className="px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-white font-semibold">CortexLog</p>
            <p className="text-slate-400 text-sm">Pemantauan Keamanan Real-time & Deteksi Ancaman</p>
          </div>
          <div className="text-center text-slate-500 text-sm">
            <p>&copy; 2026 CortexLog. Semua hak dilindungi.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
