import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin',
  database: process.env.DB_DATABASE || 'CortexLogDB',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function sendTelegramAlert(message) {
  try {
    const resSettings = await pool.query("SELECT bot_token, chat_id FROM telegram_settings WHERE is_enabled = true LIMIT 1");
    if (resSettings.rows.length === 0) {
       console.warn("Telegram tidak aktif di DB. Simulasi peringatan mandek di sini.");
       return;
    }
    const token = resSettings.rows[0].bot_token;
    const chatId = resSettings.rows[0].chat_id;

    if (!token || !chatId) {
      console.warn("Token atau Chat ID kosong di setting database. Fitur Telegram tertunda, namun simulasi database dilanjutkan!");
      return;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🚨 <b>CORTEXLOG MOCK ALERT</b> 🚨\n\n${message}`,
        parse_mode: "HTML"
      })
    });
    
    if (res.ok) {
       console.log("=> Pesan Telegram berhasil dikirim!");
    } else {
       console.log("=> Gagal kirim pesan Telegram:", await res.text());
    }
  } catch(e) {
    console.error("Error Telegram:", e.message); 
  }
}

async function runDummyTest() {
  const client = await pool.connect();
  console.log("Menghubungkan ke Database...");

  try {
    await client.query("BEGIN");

    // 1. Buat Dummy di apache_logs
    const insertApache = await client.query(`
      INSERT INTO apache_logs (ip_address, timestamp, method, request_url, status_code, user_agent, bytes_sent, http_version, referrer)
      VALUES 
      ('192.168.1.99', NOW(), 'GET', '/login?username=admin'' OR 1=1--', 200, 'MockAgent/1.0', 512, 'HTTP/1.1', '-')
      RETURNING id_log
    `);
    console.log("=> Insert apache_logs berhasil.");

    // 2. Buat Dummy di parsed_logs
    const insertParsed = await client.query(`
      INSERT INTO parsed_logs (ip_address, timestamp, method, request_url, http_version, status_code, bytes_sent, referrer, user_agent)
      VALUES 
      ('192.168.1.99', NOW(), 'GET', '/login?username=admin'' OR 1=1--', 'HTTP/1.1', 200, 512, '-', 'MockAgent/1.0')
      RETURNING id_parsed
    `);
    const idParsed = insertParsed.rows[0].id_parsed;
    console.log("=> Insert parsed_logs berhasil.");

    // 3. Buat Dummy di machine_learning_results (Simulasi SQL Injection)
    const insertML = await client.query(`
      INSERT INTO machine_learning_results (id_parsed, anomaly_score, is_anomaly, attack_type, confidence_score)
      VALUES ($1, 0.85, true, 'SQL Injection', 98.5)
      RETURNING id_ml_result
    `, [idParsed]);
    const idMlResult = insertML.rows[0].id_ml_result;
    console.log("=> Insert machine_learning_results berhasil.");

    // 4. Catat notifikasi ancaman
    const message = "IP: 192.168.1.99\nURL: /login?username=admin' OR 1=1--\nMethod: GET  Status: 200\nIndikasi: SQL Injection";
    
    const notif = await client.query(`
      INSERT INTO notifications (id_ml_result, message, notification_type, severity_level, status)
      VALUES ($1, $2, 'Attack Alert', 'Critical', 'Pending') 
      RETURNING id_notification
    `, [idMlResult, message]);
    const idNotif = notif.rows[0].id_notification;
    console.log("=> Insert notification alert berhasil.");

    // 5. Buat Report Excel simulasi (Auto Report)
    const rep = await client.query(`
      INSERT INTO reports (file_name, total_attacks, generated_by)
      VALUES ($1, 1, NULL) 
      RETURNING id_report
    `, [`mock_report_${Date.now()}.xlsx`]);
    const idReport = rep.rows[0].id_report;

    await client.query("UPDATE notifications SET id_report = $1 WHERE id_notification = $2", [idReport, idNotif]);
    console.log("=> Insert reports berhasil.");

    // ======== 6. Skenario Kedua: Anomali Murni ========
    // 1. Buat Dummy di apache_logs (Anomali Murni, misal spam req atau aneh tanpa trigger attack)
    const insApache2 = await client.query(`
      INSERT INTO apache_logs (ip_address, timestamp, method, request_url, status_code, user_agent, bytes_sent, http_version, referrer)
      VALUES 
      ('10.0.0.99', NOW(), 'POST', '/hidden-endpoint', 404, 'UnknownScanner/1.0', 0, 'HTTP/1.1', '-')
      RETURNING id_log
    `);
    
    // 2. Buat Dummy di parsed_logs
    const insParsed2 = await client.query(`
      INSERT INTO parsed_logs (ip_address, timestamp, method, request_url, http_version, status_code, bytes_sent, referrer, user_agent)
      VALUES 
      ('10.0.0.99', NOW(), 'POST', '/hidden-endpoint', 'HTTP/1.1', 404, 0, '-', 'UnknownScanner/1.0')
      RETURNING id_parsed
    `);
    const idParsed2 = insParsed2.rows[0].id_parsed;

    // 3. Buat Dummy machine_learning_results (HANYA Anomaly, Bukan Attack)
    const insML2 = await client.query(`
      INSERT INTO machine_learning_results (id_parsed, anomaly_score, is_anomaly, attack_type, confidence_score)
      VALUES ($1, 0.92, true, 'Normal', 12.0)
      RETURNING id_ml_result
    `, [idParsed2]);
    const idMlResult2 = insML2.rows[0].id_ml_result;

    // 4. Catat notifikasi ancaman
    const messageAnomali = "IP: 10.0.0.99\nURL: /hidden-endpoint\nMethod: POST  Status: 404\nIndikasi: Anomali (Aktivitas Mencurigakan)";
    await client.query(`
      INSERT INTO notifications (id_ml_result, message, notification_type, severity_level, status)
      VALUES ($1, $2, 'Warning', 'Medium', 'Pending') 
    `, [idMlResult2, messageAnomali]);
    console.log("=> Insert notification Anomali berhasil.");

    // ======== 7. Skenario Ketiga: Log Normal Murni ========
    // 1. Buat Dummy di apache_logs (Akses Web Biasa)
    await client.query(`
      INSERT INTO apache_logs (ip_address, timestamp, method, request_url, status_code, user_agent, bytes_sent, http_version, referrer)
      VALUES 
      ('192.168.1.100', NOW(), 'GET', '/index.html', 200, 'Mozilla/5.0', 1024, 'HTTP/1.1', '-')
    `);
    
    // 2. Buat Dummy di parsed_logs
    const insParsed3 = await client.query(`
      INSERT INTO parsed_logs (ip_address, timestamp, method, request_url, http_version, status_code, bytes_sent, referrer, user_agent)
      VALUES 
      ('192.168.1.100', NOW(), 'GET', '/index.html', 'HTTP/1.1', 200, 1024, '-', 'Mozilla/5.0')
      RETURNING id_parsed
    `);
    const idParsed3 = insParsed3.rows[0].id_parsed;

    // 3. Buat Dummy machine_learning_results (Normal)
    await client.query(`
      INSERT INTO machine_learning_results (id_parsed, anomaly_score, is_anomaly, attack_type, confidence_score)
      VALUES ($1, 0.12, false, 'Normal', 95.0)
    `, [idParsed3]);
    console.log("=> Insert log Murni Normal berhasil.");

    await client.query("COMMIT");

    // Tembak Telegram API (jika ada token di .env)
    await sendTelegramAlert(message);
    await sendTelegramAlert(messageAnomali);
    console.log("\nProses generate data ML dummy BERHASIL. Cek Dashboard Web kamu!");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Gagal insert mock data:", err);
  } finally {
    client.release();
    pool.end();
  }
}

runDummyTest();
