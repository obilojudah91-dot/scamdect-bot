import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../helper';

describe('API Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoints', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.data.status).toBe('healthy');
    });

    it('should return readiness status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/readiness',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(payload.data.status).toBe('ready');
    });
  });

  describe('User Endpoints', () => {
    it('should return 401 without Telegram ID header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': '999999999',
        },
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Admin Endpoints', () => {
    it('should return 401 without Telegram ID header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/stats',
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/stats',
        headers: {
          'x-telegram-id': '123456789',
        },
      });

      expect(response.statusCode).toBe(403);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Webhook Endpoint', () => {
    it('should return 401 without secret token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/telegram/webhook',
        payload: { update_id: 1 },
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with invalid secret token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/telegram/webhook',
        headers: {
          'x-telegram-bot-api-secret-token': 'invalid_secret',
        },
        payload: { update_id: 1 },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
