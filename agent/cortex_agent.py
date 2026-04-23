import os
import time
import json
import requests
from dotenv import load_dotenv

# Load environment variables dari root project
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

# -------------------------------------------------------------------
# CORTEXLOG AGENT CONFIGURATION
# -------------------------------------------------------------------
CORTEXLOG_API_URL = os.getenv("CORTEX_AGENT_TARGET_URL", "http://127.0.0.1:3000/api/analyze-logs")

def get_default_log_path():
    if os.name == 'nt':
        return os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'access.log'))
    return "/var/log/apache2/access.log"

LOG_FILE_PATH = os.getenv("CORTEX_AGENT_LOG_PATH", get_default_log_path())
CHECK_INTERVAL_SECONDS = int(os.getenv("CORTEX_AGENT_INTERVAL", "5"))
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

    # Pastikan format enter menggunakan \n agar diterima Regex Next.js
    sanitized_logs = raw_logs_str.replace('\r\n', '\n')

    payload = {
        "rawLogs": sanitized_logs.strip(),
        "userId": "agent_system"
    }

    try:
        # Meningkatkan timeout ke 60 detik agar lebih sabar menunggu proses data besar di server
        response = requests.post(CORTEXLOG_API_URL, json=payload, timeout=60)
        if response.status_code == 200:
            res_data = response.json()
            print(f"[OK] Berhasil mengirim log. Terdeteksi {res_data.get('summary', {}).get('total_attacks', 0)} serangan.")
        else:
            print(f"[ERROR] Gagal Mengirim ({response.status_code}). Pesan: {response.text[:200]}")
    except Exception as e:
        print(f"[ERROR] Koneksi Gagal (Mungkin Dashboard/API 3000 belum nyala): {e}")

def start_agent():
    if not os.path.exists(LOG_FILE_PATH):
        # Buat file kosong jika belum ada agar tidak error
        with open(LOG_FILE_PATH, 'w') as f: pass
        print(f"File log baru dibuat: {LOG_FILE_PATH}")

    print(f"=== CORTEXLOG AGENT START ===")
    print(f"Membaca / Monitoring: {LOG_FILE_PATH}")
    print(f"Target Pengiriman: {CORTEXLOG_API_URL}")
    print("-----------------------------\n")

    # Mulai dari awal file (posisi 0) untuk rekapitulasi data jika diperlukan
    last_pos = 0

    try:
        while True:
            current_size = os.path.getsize(LOG_FILE_PATH)
            
            if current_size > last_pos:
                with open(LOG_FILE_PATH, 'r') as file:
                    file.seek(last_pos)
                    
                    batch_lines = []
                    for line in file:
                        batch_lines.append(line)
                        if len(batch_lines) >= 50:
                            send_to_cortexlog("".join(batch_lines))
                            time.sleep(5) # Jeda untuk mencegah overload pada API/Telegram
                            batch_lines = []
                    
                    if batch_lines:
                        send_to_cortexlog("".join(batch_lines))
                        
                    last_pos = file.tell()
            
            elif current_size < last_pos:
                last_pos = current_size

            time.sleep(CHECK_INTERVAL_SECONDS)
    
    except KeyboardInterrupt:
        print("\nAgen dihentikan. Keluar.")

if __name__ == "__main__":
    start_agent()
