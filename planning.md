# Planning: Bot Telegram Email Alert (Outlook → Power Automate → Node.js → Telegram)

## 1. Latar Belakang & Tujuan

Kita butuh sistem yang bisa menangkap email alert tertentu dari mailbox Outlook (Office 365, tenant `365tsel.onmicrosoft.com`) dan meneruskannya sebagai notifikasi ke Telegram.

Karena kita **tidak punya akses admin** untuk registrasi aplikasi di Azure AD (app registration dengan Graph API), dan **auto-forward eksternal diblokir** oleh transport rule admin tenant, maka solusi yang dipakai adalah:

```
Outlook (mailbox pribadi/kerja user)
   → Power Automate (trigger: email masuk, tidak perlu admin consent)
   → HTTP POST ke webhook
   → Bot Node.js (Express) yang menerima webhook
   → Kirim notifikasi ke Telegram (Bot API)
```

Dokumen ini adalah panduan langkah demi langkah untuk implementasi, ditulis supaya bisa diikuti oleh junior programmer atau AI model yang lebih murah/kecil tanpa perlu banyak konteks tambahan.

---

## 2. Prasyarat

Sebelum mulai coding, pastikan hal berikut sudah tersedia:

- [ ] Node.js versi 18+ terinstall (`node -v` untuk cek)
- [ ] Akun Telegram, sudah bikin bot via [@BotFather](https://t.me/BotFather) dan punya `BOT_TOKEN`
- [ ] Sudah tahu `CHAT_ID` tujuan (personal chat atau grup) — bisa didapat via bot [@userinfobot](https://t.me/userinfobot) atau endpoint `getUpdates`
- [ ] Akses ke akun Outlook/Office 365 kantor (akun user biasa, bukan admin)
- [ ] Akses ke https://make.powerautomate.com dengan akun kantor tersebut
- [ ] Akun untuk deployment (pilih salah satu): Railway, Render, VPS, atau ngrok untuk testing lokal
- [ ] Git & GitHub account (untuk version control)

---

## 3. Struktur Folder Project

Gunakan struktur berikut supaya rapi dan mudah di-maintain:

```
email-alert-bot/
├── src/
│   ├── config/
│   │   └── env.js               # Load & validasi environment variables
│   ├── routes/
│   │   └── webhook.route.js     # Definisi endpoint POST /webhook/email-alert
│   ├── controllers/
│   │   └── webhook.controller.js # Logic terima request, validasi, panggil service
│   ├── services/
│   │   └── telegram.service.js  # Logic kirim pesan ke Telegram
│   ├── middlewares/
│   │   └── verifySecret.js      # Middleware validasi header secret dari Power Automate
│   ├── utils/
│   │   └── formatMessage.js     # Helper format teks pesan alert
│   └── app.js                   # Setup express app (middleware, routes)
├── tests/
│   └── webhook.test.js          # Unit/integration test endpoint webhook
├── .env.example                 # Contoh environment variable (tanpa value asli)
├── .env                         # Environment variable asli (JANGAN commit ke git)
├── .gitignore
├── package.json
├── server.js                    # Entry point, jalankan app.listen()
├── README.md                    # Cara install & jalankan project
└── planning.md                  # Dokumen ini
```

**Prinsip pemisahan folder:**
- `routes` → hanya define path & method HTTP
- `controllers` → terima request, validasi input, panggil service, kirim response
- `services` → logic bisnis inti (integrasi ke API eksternal seperti Telegram)
- `middlewares` → logic yang jalan sebelum controller (misal auth/secret check)
- `utils` → fungsi kecil yang dipakai berulang, tidak bergantung ke request/response

Alur data: `routes → middlewares → controllers → services → response`

---

## 4. Tahapan Implementasi

### Tahap 1 — Setup Project Dasar
1. Buat folder project sesuai struktur di atas.
2. `npm init -y` lalu install dependency:
   ```bash
   npm install express dotenv node-telegram-bot-api
   npm install --save-dev nodemon jest supertest
   ```
3. Buat `.gitignore` berisi minimal:
   ```
   node_modules/
   .env
   ```
4. Buat `.env.example`:
   ```
   PORT=3000
   BOT_TOKEN=
   CHAT_ID=
   WEBHOOK_SECRET=
   ```
5. Copy jadi `.env` dan isi value asli (BOT_TOKEN dari BotFather, CHAT_ID dari userinfobot, WEBHOOK_SECRET boleh generate string random sendiri).

**Definition of Done:** `npm run dev` bisa jalan tanpa error, meskipun endpoint belum ada isinya.

---

### Tahap 2 — Bikin Bot Telegram
1. Chat ke [@BotFather](https://t.me/BotFather) di Telegram, kirim `/newbot`, ikuti instruksi, catat `BOT_TOKEN` yang diberikan.
2. Tambahkan bot ke grup Telegram tujuan (kalau notifikasi mau masuk ke grup), atau langsung chat personal ke bot (kalau notifikasi personal).
3. Ambil `CHAT_ID`:
   - Kirim pesan apa saja ke bot/grup
   - Buka `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates` di browser
   - Cari field `"chat":{"id": ...}` dari response JSON
4. Test kirim pesan manual pakai curl untuk memastikan token & chat id benar:
   ```bash
   curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage" \
     -d "chat_id=<CHAT_ID>" -d "text=Test dari curl"
   ```

**Definition of Done:** Pesan "Test dari curl" muncul di Telegram.

---

### Tahap 3 — Implementasi Webhook Server (Node.js)

Urutan file yang dibuat (ikuti urutan ini supaya dependency antar file jelas):

1. **`src/config/env.js`** — load `dotenv`, export semua env var yang dibutuhkan, lempar error saat startup kalau ada yang kosong (fail fast).
2. **`src/utils/formatMessage.js`** — fungsi `formatEmailAlert({ subject, from, body, receivedTime })` yang return string siap kirim ke Telegram (format Markdown).
3. **`src/services/telegram.service.js`** — fungsi `sendTelegramMessage(text)` yang bungkus pemanggilan `node-telegram-bot-api`.
4. **`src/middlewares/verifySecret.js`** — cek header `x-webhook-secret` dari request, dibandingkan dengan `WEBHOOK_SECRET` di env. Kalau tidak cocok → response 401.
5. **`src/controllers/webhook.controller.js`** — fungsi `handleEmailAlert(req, res)`:
   - Ambil `subject`, `from`, `body`, `receivedTime` dari `req.body`
   - Validasi field wajib ada (minimal `subject` dan `from`)
   - Panggil `formatEmailAlert` lalu `sendTelegramMessage`
   - Response 200 kalau sukses, 500 kalau gagal kirim ke Telegram, 400 kalau input tidak valid
6. **`src/routes/webhook.route.js`** — define `router.post('/webhook/email-alert', verifySecret, handleEmailAlert)`
7. **`src/app.js`** — setup `express()`, `app.use(express.json())`, mount router
8. **`server.js`** — import `app` dari `src/app.js`, jalankan `app.listen(PORT)`

**Definition of Done:**
- Server jalan di `localhost:3000`
- Test pakai curl/Postman ke `POST /webhook/email-alert` dengan body JSON contoh dan header secret yang benar → pesan masuk ke Telegram
- Tanpa header secret / secret salah → dapat response 401

Contoh test manual:
```bash
curl -X POST http://localhost:3000/webhook/email-alert \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <isi sesuai .env>" \
  -d '{
    "subject": "Server Down Alert",
    "from": "monitoring@company.com",
    "body": "CPU usage 95% selama 5 menit",
    "receivedTime": "2026-08-27T10:00:00Z"
  }'
```

---

### Tahap 4 — Testing Lokal dengan Power Automate

1. Jalankan server lokal (`npm run dev`)
2. Buka terowongan publik pakai ngrok:
   ```bash
   ngrok http 3000
   ```
   Catat URL publik yang muncul (misal `https://abcd1234.ngrok-free.app`)
3. Buka https://make.powerautomate.com → **Create** → **Automated cloud flow**
4. Trigger: **"When a new email arrives (V3)"** (connector Outlook 365)
   - Set folder: Inbox
   - Set filter `From` / `Subject Filter` sesuai kebutuhan alert
5. Tambah action **HTTP**:
   - Method: `POST`
   - URI: `https://abcd1234.ngrok-free.app/webhook/email-alert`
   - Headers: 
     ```
     Content-Type: application/json
     x-webhook-secret: <isi sesuai .env WEBHOOK_SECRET>
     ```
   - Body:
     ```json
     {
       "subject": "@{triggerBody()?['subject']}",
       "from": "@{triggerBody()?['from']}",
       "body": "@{triggerBody()?['bodyPreview']}",
       "receivedTime": "@{triggerBody()?['receivedDateTime']}"
     }
     ```
6. Save flow, kirim email test ke mailbox yang dipantau, cek apakah notifikasi masuk ke Telegram.

**Definition of Done:** Email test yang masuk ke Outlook berhasil trigger notifikasi Telegram end-to-end.

---

### Tahap 5 — Deployment ke Production

Karena ngrok URL berubah setiap restart (kecuali versi berbayar), untuk pemakaian jangka panjang server harus di-deploy ke tempat dengan URL tetap. Pilih salah satu:

**Opsi A — Railway/Render (paling gampang untuk pemula)**
1. Push project ke GitHub repo
2. Connect repo ke Railway/Render
3. Set environment variables (`BOT_TOKEN`, `CHAT_ID`, `WEBHOOK_SECRET`, `PORT`) di dashboard mereka
4. Deploy, catat URL production yang diberikan

**Opsi B — VPS (lebih fleksibel, butuh maintenance sendiri)**
1. Setup VPS (misal DigitalOcean/domain sendiri)
2. Install Node.js, clone repo
3. Pakai `pm2` untuk menjaga proses tetap hidup:
   ```bash
   npm install -g pm2
   pm2 start server.js --name email-alert-bot
   pm2 save
   pm2 startup
   ```
4. Setup reverse proxy (nginx) + SSL (certbot) supaya bisa diakses via HTTPS

**Setelah deploy:** update URI di HTTP action Power Automate dari URL ngrok ke URL production yang baru.

**Definition of Done:** Flow Power Automate memakai URL production, server tetap jalan meskipun laptop development dimatikan.

---

### Tahap 6 — Hardening & Monitoring (opsional tapi direkomendasikan)

- [ ] Tambah logging (misal pakai `winston` atau `pino`) supaya history alert yang diterima bisa ditelusuri
- [ ] Tambah rate limiting sederhana di endpoint webhook (`express-rate-limit`) untuk cegah abuse
- [ ] Tambah retry mechanism kalau `sendTelegramMessage` gagal (misal network error sementara)
- [ ] Tambah health check endpoint (`GET /health`) untuk memudahkan monitoring uptime
- [ ] Dokumentasikan cara rotate `WEBHOOK_SECRET` kalau dicurigai bocor

---

## 5. Environment Variables Reference

| Variable | Wajib | Deskripsi | Contoh |
|---|---|---|---|
| `PORT` | Ya | Port server Express | `3000` |
| `BOT_TOKEN` | Ya | Token bot dari BotFather | `123456:ABC-DEF...` |
| `CHAT_ID` | Ya | ID chat/grup tujuan notifikasi | `-1001234567890` |
| `WEBHOOK_SECRET` | Ya | Secret untuk validasi request dari Power Automate | string random, misal hasil `openssl rand -hex 16` |

---

## 6. Catatan & Batasan

- Solusi ini bergantung pada **lisensi Power Automate** di akun user — kalau suatu saat izin ini dicabut oleh IT, perlu cari jalan lain (misal minta app registration delegated permission ke admin).
- Karena tidak pakai Graph API resmi, field yang tersedia dari trigger Outlook terbatas pada apa yang disediakan connector (`subject`, `from`, `bodyPreview`, `receivedDateTime`, dll) — tidak semua metadata email bisa diakses.
- `WEBHOOK_SECRET` adalah lapisan keamanan minimal (bukan enkripsi), pastikan endpoint tetap di-serve via HTTPS supaya secret tidak bocor saat transit.
- Kalau kebutuhan berkembang (misal butuh baca email lama/histori, bukan cuma email baru), pendekatan ini perlu direvisi karena Power Automate trigger hanya menangkap email yang masuk **setelah** flow aktif.
