"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { showSuccess, showError, confirmAction } from "@/lib/swal";

export default function TelegramSettings({ onClose }) {
  const [settings, setSettings] = useState({
    botToken: "",
    chatId: "",
    alertLevel: "warning_critical",
    enabled: false,
  });

  const [loading, setLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  // Escape key handler & focus trap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    // Auto-focus modal
    if (modalRef.current) {
      const firstInput = modalRef.current.querySelector('input, button, select');
      firstInput?.focus();
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/telegram-settings");
      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
      }
      setError(null);
    } catch (err) {
      setError("Gagal mengambil pengaturan Telegram");
      console.error("Error fetching telegram settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/telegram-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: settings.botToken,
          chatId: settings.chatId,
          alertLevel: settings.alertLevel,
          enabled: settings.enabled,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showSuccess("Pengaturan tersimpan");
      } else {
        showError("Gagal Menyimpan", data.error || "Terjadi kesalahan saat menyimpan pengaturan");
      }
    } catch (err) {
      showError("Kesalahan", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestTrigger = async () => {
    const confirmed = await confirmAction(
      "Uji Koneksi Telegram",
      "Kirim pesan uji ke chat Telegram Anda?",
      "Ya, Kirim"
    );

    if (confirmed) {
      handleTestConnection();
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);

    try {
      const response = await fetch("/api/telegram-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testBotToken: settings.botToken,
          testChatId: settings.chatId,
        }),
      });

      const result = await response.json();
      setTestingConnection(false);

      if (result.success) {
        showSuccess(result.message || "Koneksi berhasil! Periksa bot Anda.");
      } else {
        showError("Tes Koneksi Gagal", result.error || "Gagal menghubungi bot Telegram");
      }
    } catch (err) {
      setTestingConnection(false);
      showError("Kesalahan Sistem", err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="telegram-settings-title">
      <div ref={modalRef} className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
          <div>
            <h2 id="telegram-settings-title" className="text-2xl font-bold text-white">
              Manajemen Telegram
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Konfigurasi bot Telegram untuk pemberitahuan keamanan
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2" role="alert">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-slate-400">
                Memuat pengaturan Telegram...
              </div>
            </div>
          ) : (
            <>
              {/* Telegram Bot Configuration */}
              <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-6 space-y-4">
                <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-700">
                  Konfigurasi Bot
                </h3>

                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded border border-slate-700">
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Aktifkan Pemberitahuan Telegram
                    </p>
                    <p className="text-xs text-slate-500">
                      Aktifkan/nonaktifkan notifikasi
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={settings.enabled}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Bot Token */}
                <div>
                  <label htmlFor="botToken" className="block text-sm font-semibold text-slate-300 mb-2">
                    Token Bot
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="botToken"
                      type={showToken ? "text" : "password"}
                      name="botToken"
                      value={settings.botToken}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm transition"
                      placeholder="Tempel token bot di sini"
                      autoComplete="off"
                    />
                    <button
                      onClick={() => setShowToken(!showToken)}
                      className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition text-sm whitespace-nowrap flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      aria-label={showToken ? "Sembunyikan token" : "Tampilkan token"}
                    >
                      {showToken ? (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg> Sembunyikan</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> Tampilkan</>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Buat bot di{" "}
                    <span className="text-blue-400">@BotFather</span> di
                    Telegram
                  </p>
                </div>

                {/* Chat ID */}
                <div>
                  <label htmlFor="chatId" className="block text-sm font-semibold text-slate-300 mb-2">
                    ID Chat (Grup Admin/Pribadi)
                  </label>
                  <input
                    id="chatId"
                    type="text"
                    name="chatId"
                    value={settings.chatId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm transition"
                    placeholder="-1001234567890"
                    autoComplete="off"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Temukan ID chat Anda dengan{" "}
                    <span className="text-blue-400">@userinfobot</span> atau ID
                    grup untuk pemberitahuan admin
                  </p>
                </div>

                {/* Alert Level */}
                <div>
                  <label htmlFor="alertLevel" className="block text-sm font-semibold text-slate-300 mb-2">
                    Level Pemberitahuan (Kirim Pemberitahuan untuk:)
                  </label>
                  <select
                    id="alertLevel"
                    name="alertLevel"
                    value={settings.alertLevel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm transition"
                  >
                    <option value="all">Semua Acara (Verbose)</option>
                    <option value="warning_critical">
                      Peringatan & Kritis Saja (Disarankan)
                    </option>
                    <option value="critical">
                      Hanya Kritis (Serangan berisiko tinggi)
                    </option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Pilih acara keamanan mana yang memicu pemberitahuan Telegram
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 flex items-center gap-2"
                >
                  {saving ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Menyimpan...</>
                  ) : "Simpan Pengaturan"}
                </button>
                <button
                  onClick={handleTestTrigger}
                  disabled={testingConnection}
                  className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500/40"
                >
                  {testingConnection ? "Menguji..." : "Uji Koneksi"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
