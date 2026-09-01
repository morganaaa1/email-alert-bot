# Bot Telegram Email Alert (Outlook → Power Automate → Node.js → Telegram)

A Node.js Express webhook service designed to receive email alert payloads from Microsoft Power Automate (Outlook 365 trigger) and forward formatted notifications to a Telegram chat or group.

---

## 📁 Project Structure

```
email-alert-bot/
├── src/
│   ├── config/
│   │   └── env.js               # Load & validate environment variables
│   ├── routes/
│   │   └── webhook.route.js     # Express routes definition
│   ├── controllers/
│   │   └── webhook.controller.js # Webhook request handler
│   ├── services/
│   │   └── telegram.service.js  # Telegram Bot API client service
│   ├── middlewares/
│   │   └── verifySecret.js      # Middleware for header secret authentication
│   ├── utils/
│   │   └── formatMessage.js     # Helper function to format alert messages
│   └── app.js                   # Express app setup
├── tests/
│   └── webhook.test.js          # Integration tests for webhook endpoint
├── .env.example                 # Environment variables template
├── .env                         # Local environment variables
├── .gitignore
├── package.json
├── server.js                    # Server entry point
├── README.md
└── planning.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your configuration values in `.env`:

```env
PORT=3000
BOT_TOKEN=123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
CHAT_ID=-1001234567890
WEBHOOK_SECRET=your_custom_secret_key
```

- **BOT_TOKEN**: Obtained from [@BotFather](https://t.me/BotFather).
- **CHAT_ID**: Target chat or group ID (obtained via [@userinfobot](https://t.me/userinfobot) or Telegram API `getUpdates`).
- **WEBHOOK_SECRET**: Custom secret string to authenticate incoming requests from Power Automate.

### 3. Run Development Server

```bash
npm run dev
```

### 4. Run Unit / Integration Tests

```bash
npm test
```

---

## 🔌 API Reference

### Health Check

- **URL:** `/health`
- **Method:** `GET`
- **Response:** `200 OK`

### Webhook Email Alert

- **URL:** `/webhook/email-alert`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `x-webhook-secret: <WEBHOOK_SECRET>`
- **Request Body:**

```json
{
  "subject": "Server Down Alert",
  "from": "monitoring@company.com",
  "body": "CPU utilization 95% for 5 minutes",
  "receivedTime": "2026-08-27T10:00:00Z"
}
```

- **Response:**
  - `200 OK`: Message delivered to Telegram.
  - `401 Unauthorized`: Missing or invalid secret header.
  - `400 Bad Request`: Missing required fields (`subject` or `from`).
  - `500 Internal Server Error`: Telegram delivery failed.

---

## ⚡ Power Automate Setup

1. Open [Power Automate](https://make.powerautomate.com/).
2. Create an **Automated Cloud Flow**.
3. **Trigger:** *When a new email arrives (V3)* (Office 365 Outlook).
4. **Action:** *HTTP*
   - **Method:** `POST`
   - **URI:** `https://<your-domain-or-ngrok-url>/webhook/email-alert`
   - **Headers:**
     ```
     Content-Type: application/json
     x-webhook-secret: <WEBHOOK_SECRET>
     ```
   - **Body:**
     ```json
     {
       "subject": "@{triggerBody()?['subject']}",
       "from": "@{triggerBody()?['from']}",
       "body": "@{triggerBody()?['bodyPreview']}",
       "receivedTime": "@{triggerBody()?['receivedDateTime']}"
     }
     ```
