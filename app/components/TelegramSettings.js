'use client';

import { useState } from 'react';
import ConfirmationDialog from './ConfirmationDialog';

export default function TelegramSettings({ onClose })  {
  const [settings, setSettings] = useState({
    botToken: 'MTEyMzQ1Njc4OTpBQkNERUZHSElKS0xNTk9QUlNUVVZXWFlaBCD',
    chatId: '-1001234567890',
    alertLevel: 'warning_critical',
    enabled: true
  });

  const [showToken, setShowToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [testDialog, setTestDialog] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    
    // Simulate testing connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setTestingConnection(false);
    setTestResult({
      success: true,
      message: '✓ Berhasil terhubung ke Bot Telegram. Pesan uji dikirim ke chat ID.'
    });
    setTestDialog(false);
    
    setTimeout(() => setTestResult(null), 5000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Manajemen Telegram</h2>
            <p className="text-slate-400 text-sm mt-1">Konfigurasi bot Telegram untuk pemberitahuan keamanan</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Telegram Bot Configuration */}
          <div className="border border-slate-700 rounded-lg bg-slate-900/50 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-700">
              Konfigurasi Bot
            </h3>

            {/* Enable/Disable */}
            <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded border border-slate-700">
              <div>
                <p className="font-semibold text-white text-sm">Aktifkan Pemberitahuan Telegram</p>
                <p className="text-xs text-slate-500">Aktifkan/nonaktifkan notifikasi</p>
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
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Token Bot
              </label>
              <div className="flex gap-2">
                <input
                  type={showToken ? 'text' : 'password'}
                  name="botToken"
                  value={settings.botToken}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Tempel token bot di sini"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition text-sm whitespace-nowrap"
                >
                  {showToken ? '🙈 Sembunyikan' : '👁 Tampilkan'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Buat bot di <span className="text-blue-400">@BotFather</span> di Telegram
              </p>
            </div>

            {/* Chat ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                ID Chat (Grup Admin/Pribadi)
              </label>
              <input
                type="text"
                name="chatId"
                value={settings.chatId}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500 text-sm"
                placeholder="-1001234567890"
              />
              <p className="text-xs text-slate-500 mt-1">
                Temukan ID chat Anda dengan <span className="text-blue-400">@userinfobot</span> atau ID grup untuk pemberitahuan admin
              </p>
            </div>

            {/* Alert Level */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Level Pemberitahuan (Kirim Pemberitahuan untuk:)
              </label>
              <select
                name="alertLevel"
                value={settings.alertLevel}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-600 text-white rounded focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="all">Semua Acara (Verbose)</option>
                <option value="warning_critical">⚠️ Peringatan & Kritis Saja (Disarankan)</option>
                <option value="critical">🔴 Hanya Kritis (Serangan berisiko tinggi)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Pilih acara keamanan mana yang memicu pemberitahuan Telegram
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="border border-blue-700 bg-blue-900/20 rounded-lg p-4 text-sm text-blue-300">
            <p>
              <strong>📋 Integrasi Telegram:</strong> Mengaktifkan pemberitahuan seluler instan ke grup admin atau chat pribadi. Penting untuk respons insiden keamanan real-time. Pemberitahuan mencakup deteksi serangan, peringatan anomali, dan pembaruan status sistem.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Simpan Pengaturan
            </button>
            <button
              onClick={() => setTestDialog(true)}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
            >
              🔔 UIJI KONEKSI
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <span>✓</span>
                <span>Pengaturan tersimpan</span>
              </div>
            )}
            {testResult && (
              <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                <span>{testResult.success ? '✓' : '✗'}</span>
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Test Connection Dialog */}
      <ConfirmationDialog
        isOpen={testDialog}
        title="Uji Koneksi Telegram"
        message="Kirim pesan uji ke chat Telegram? Ini akan memverifikasi token bot dan ID chat sudah benar."
        onConfirm={handleTestConnection}
        onCancel={() => setTestDialog(false)}
        isDanger={false}
        confirmText={testingConnection ? '⏳ Menguji...' : '✓ Kirim Pesan Uji'}
        confirmDisabled={testingConnection}
      />
    </div>
  );
}
