const request = require('supertest');

// Set dummy environment variables for testing
process.env.PORT = '3000';
process.env.BOT_TOKEN = 'test_token';
process.env.CHAT_ID = '12345678';
process.env.WEBHOOK_SECRET = 'supersecretkey';

// Mock Telegram service
jest.mock('../src/services/telegram.service', () => ({
  sendTelegramMessage: jest.fn().mockResolvedValue({ message_id: 1 }),
  sendTelegramDocument: jest.fn().mockResolvedValue({ message_id: 2 }),
}));

const app = require('../src/app');
const { sendTelegramMessage, sendTelegramDocument } = require('../src/services/telegram.service');

describe('POST /webhook/email-alert Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should return 401 Unauthorized if x-webhook-secret header is missing', async () => {
    const response = await request(app)
      .post('/webhook/email-alert')
      .send({ subject: 'Test', from: 'sender@example.com' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('Should return 401 Unauthorized if x-webhook-secret header is invalid', async () => {
    const response = await request(app)
      .post('/webhook/email-alert')
      .set('x-webhook-secret', 'wrong_secret')
      .send({ subject: 'Test', from: 'sender@example.com' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('Should return 400 Bad Request if subject or from is missing', async () => {
    const response = await request(app)
      .post('/webhook/email-alert')
      .set('x-webhook-secret', 'supersecretkey')
      .send({ body: 'Missing subject and from' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('Should return 200 OK and send Telegram notification when payload is valid', async () => {
    const payload = {
      subject: 'Server High CPU Alert',
      from: 'monitoring@company.com',
      body: 'CPU utilization reached 95%',
      receivedTime: '2026-08-27T10:00:00Z',
    };

    const response = await request(app)
      .post('/webhook/email-alert')
      .set('x-webhook-secret', 'supersecretkey')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
  });

  test('Should return 200 OK and send documents when payload includes attachments', async () => {
    const payload = {
      subject: 'Report Alert',
      from: 'monitoring@company.com',
      body: 'See attached report',
      receivedTime: '2026-08-27T10:00:00Z',
      attachments: [
        { name: 'report.pdf', contentBytes: 'SGVsbG8=' }
      ]
    };

    const response = await request(app)
      .post('/webhook/email-alert')
      .set('x-webhook-secret', 'supersecretkey')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
    expect(sendTelegramDocument).toHaveBeenCalledWith('SGVsbG8=', 'report.pdf');
  });

  test('Should return 500 Internal Server Error if Telegram service throws an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    sendTelegramMessage.mockRejectedValueOnce(new Error('Telegram API Error'));

    const response = await request(app)
      .post('/webhook/email-alert')
      .set('x-webhook-secret', 'supersecretkey')
      .send({ subject: 'Test', from: 'sender@example.com' });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);

    consoleSpy.mockRestore();
  });
});
