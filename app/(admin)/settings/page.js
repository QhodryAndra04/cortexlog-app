"use client";

import { useState, useCallback, useEffect } from "react";
import { showSuccess, showError } from "@/lib/swal";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    botToken: "",
    chatId: "",
    alertLevel: "warning_critical",
    enabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/telegram-settings");
      if (!res.ok) throw new Error("Gagal mengambil pengaturan");
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (err) {
      showError("Gagal Memuat", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/telegram-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Pengaturan berhasil disimpan!");
      } else {
        throw new Error(data.error || "Gagal menyimpan");
      }
    } catch (err) {
      showError("Kesalahan", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/telegram-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testBotToken: settings.botToken,
          testChatId: settings.chatId,
          isNotification: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess("Koneksi berhasil! Periksa Telegram Anda.");
      } else {
        throw new Error(data.error || "Gagal tes koneksi");
      }
    } catch (err) {
      showError("Tes Koneksi Gagal", err.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-[#151719] min-h-screen">
      <div className="px-6 py-6 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-center sm:text-left">Pengaturan Sistem</h1>
          <p className="text-slate-400 text-sm mt-1 text-center sm:text-left">Konfigurasi notifikasi Telegram dan parameter keamanan.</p>
        </div>



        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-white">Notifikasi Telegram</h2>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Bot Token</label>
                <input
                  type="password"
                  value={settings.botToken}
                  onChange={(e) => setSettings({ ...settings, botToken: e.target.value })}
                  placeholder="Masukkan Token dari @BotFather"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Chat ID</label>
                <input
                  type="text"
                  value={settings.chatId}
                  onChange={(e) => setSettings({ ...settings, chatId: e.target.value })}
                  placeholder="ID Chat atau Grup untuk alert"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${settings.enabled ? "bg-green-500 animate-pulse" : "bg-slate-700"}`}></div>
                <div>
                  <p className="text-sm font-bold text-white">Status Notifikasi</p>
                  <p className="text-xs text-slate-500">Aktifkan pengiriman pesan otomatis saat serangan terdeteksi.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                )}
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || isLoading || !settings.botToken}
                className="sm:w-auto px-8 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold py-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                {isTesting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white/50 border-t-white rounded-full"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
                Tes Koneksi
              </button>
            </div>
          </form>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-center">
          <p className="text-slate-500 text-xs tracking-widest uppercase mb-1">Keamanan Dashboard</p>
          <p className="text-slate-400 text-sm">Fitur penggantian kata sandi admin sedang dalam pengembangan.</p>
        </div>
      </div>
    </div>
  );
}
