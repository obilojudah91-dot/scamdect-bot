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
      expect(payload.data.timestamp).toBeDefined();
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
      expect(payload.data.timestamp).toBeDefined();
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
      expect(payload.error.message).toBe('Missing Telegram ID');
    });

    it('should return 400 with invalid Telegram ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': 'invalid',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('VALIDATION_ERROR');
      expect(payload.error.message).toBe('Invalid Telegram ID format');
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
      expect(payload.error.message).toBe('User not found');
    });

    it('should return 401 for history without Telegram ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/history',
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for history with invalid Telegram ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/history',
        headers: {
          'x-telegram-id': 'abc',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('VALIDATION_ERROR');
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

    it('should return 400 with invalid Telegram ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/stats',
        headers: {
          'x-telegram-id': 'not-a-number',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('VALIDATION_ERROR');
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
      expect(payload.error.message).toBe('Admin access required');
    });

    it('should return 401 for users endpoint without Telegram ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users',
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 for users endpoint with non-admin', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users',
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

    it('should accept webhook with valid secret token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/telegram/webhook',
        headers: {
          'x-telegram-bot-api-secret-token': 'test_secret',
        },
        payload: { update_id: 1 },
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
    });
  });

  describe('Request Size Limits', () => {
    it('should handle normal-sized requests', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/telegram/webhook',
        headers: {
          'x-telegram-bot-api-secret-token': 'test_secret',
        },
        payload: { update_id: 1, message: { text: 'test' } },
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/unknown/endpoint',
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('NOT_FOUND');
      expect(payload.error.message).toBe('Endpoint not found');
    });
  });
});
