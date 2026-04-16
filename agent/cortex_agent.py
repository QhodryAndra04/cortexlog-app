import os
import time
import json
import requests

# -------------------------------------------------------------------
# KONFIGURASI CORTEXLOG AGENT (Satu Server Lokal)
# -------------------------------------------------------------------
# Karena CortexLog 1 server dengan Aplikasi Korban, cukup arahkan ke localhost
CORTEXLOG_API_URL = "http://127.0.0.1:3000/api/analyze-logs"

# Lakukan pencarian otomatis letak log apache/nginx yang ingin dibaca (Website Target)
LOG_FILE_PATH = "/var/log/apache2/access.log"

# Waktu jeda pengecekan (dalam detik)
# Agent akan mengecek log baru setiap 5 detik
CHECK_INTERVAL_SECONDS = 5
# -------------------------------------------------------------------

def tail_file(file, last_pos):
    """Membaca isi file log mulai dari baris terakhir (Posisi Terakhir)"""
    file.seek(last_pos)
    new_lines = file.readlines()
    current_pos = file.tell()
    return new_lines, current_pos

def send_to_cortexlog(raw_logs_str: str):
    """Mengirim block log string mentah ke API CortexLog Next.js"""
    if not raw_logs_str.strip():
        return

    payload = {
        "rawLogs": raw_logs_str.strip(),
        "userId": "agent_system"
    }

    try:
        response = requests.post(CORTEXLOG_API_URL, json=payload, timeout=10)
        if response.status_code == 200:
            print(f"[OK] Berhasil mengirim {len(raw_logs_str.strip().split(os.linesep))} baris log. Respon Backend: {response.json().get('success')}")
        else:
            print(f"[ERROR] Gagal Mengirim ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"[ERROR] API CortexLog Tidak Merespon: {e}")

def start_agent():
    if not os.path.exists(LOG_FILE_PATH):
        print(f"File log tidak ditemukan di: {LOG_FILE_PATH}")
        print("Silakan ubah 'LOG_FILE_PATH' sesuai dengan lokasi log web server anda.")
        return

    print(f"=== CORTEXLOG AGENT START ===")
    print(f"Membaca / Monitoring: {LOG_FILE_PATH}")
    print(f"Target Pengiriman: {CORTEXLOG_API_URL}")
    print("-----------------------------\n")

    # Buka file log
    with open(LOG_FILE_PATH, 'r') as file:
        # Langsung lompat ke bagian paling bawah / paling akhir file
        file.seek(0, os.SEEK_END)
        last_pos = file.tell()

        try:
            while True:
                # Baca baris log terbaru
                new_lines, last_pos = tail_file(file, last_pos)
                
                if new_lines:
                    # Gabungkan menjadi format string dengan enter (\n)
                    raw_log_string = "".join(new_lines)
                    
                    # Kirim log tersebut ke Database & Machine Learning
                    send_to_cortexlog(raw_log_string)
                
                # Tunggu 5 detik lalu cek lagi (hindari menguras CPU)
                time.sleep(CHECK_INTERVAL_SECONDS)
        
        except KeyboardInterrupt:
            print("\nAgen dihentikan oleh pengguna (Ctrl+C). Keluar.")

if __name__ == "__main__":
    start_agent()
