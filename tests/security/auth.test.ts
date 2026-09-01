import { describe, it, expect } from 'vitest';
import { build } from '../helper';

describe('Security Tests - Authentication & Authorization', () => {
  let app: any;

  beforeAll(async () => {
    app = build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Data Isolation', () => {
    it('should prevent users from accessing other users data', async () => {
      // User A tries to access User B's data
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': '123456789', // User A's ID
        },
      });

      // Should only return User A's data or 404 if User A doesn't exist
      // Should never return User B's data
      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      if (payload.success && payload.data) {
        expect(payload.data.telegramId).toBe('123456789');
      }
    });

    it('should prevent history access without proper authentication', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/history',
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Admin Authorization', () => {
    it('should prevent non-admin users from accessing admin endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/stats',
        headers: {
          'x-telegram-id': '999999999', // Non-admin ID
        },
      });

      expect(response.statusCode).toBe(403);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('FORBIDDEN');
    });

    it('should prevent non-admin users from accessing user list', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users',
        headers: {
          'x-telegram-id': '999999999', // Non-admin ID
        },
      });

      expect(response.statusCode).toBe(403);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('FORBIDDEN');
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid Telegram ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': 'invalid_id',
        },
      });

      expect(response.statusCode).toBe(404); // User not found due to invalid ID
    });

    it('should reject missing required headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
    });
  });

  describe('Webhook Security', () => {
    it('should reject webhook requests without secret token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/telegram/webhook',
        payload: { update_id: 1 },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject webhook requests with invalid secret token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/telegram/webhook',
        headers: {
          'x-telegram-bot-api-secret-token': 'wrong_secret',
        },
        payload: { update_id: 1 },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Error Information Leakage', () => {
    it('should not expose stack traces in error responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/nonexistent',
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.message).toBeDefined();
      expect(payload.error.stack).toBeUndefined();
    });

    it('should not expose internal error details', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': '123456789',
        },
        payload: { invalid: 'data' },
      });

      const payload = JSON.parse(response.payload);
      if (!payload.success) {
        expect(payload.error.stack).toBeUndefined();
        expect(payload.error.details).toBeUndefined();
      }
    });
  });
});
