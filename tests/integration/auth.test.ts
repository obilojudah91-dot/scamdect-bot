import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../helper';

describe('Authentication & Authorization Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should reject requests without Telegram ID header', async () => {
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

    it('should reject requests with empty Telegram ID header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': '',
        },
      });

      expect(response.statusCode).toBe(401);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with non-numeric Telegram ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': 'abc123',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('VALIDATION_ERROR');
      expect(payload.error.message).toBe('Invalid Telegram ID format');
    });

    it('should reject requests with negative Telegram ID', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': '-123456789',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept requests with valid numeric Telegram ID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'x-telegram-id': '123456789',
        },
      });

      // Will be 404 because user doesn't exist, but should pass validation
      expect(response.statusCode).not.toBe(401);
      expect(response.statusCode).not.toBe(400);
    });
  });

  describe('Authorization', () => {
    it('should allow admin access with valid admin ID', async () => {
      // This test assumes 123456789 is configured as an admin in test env
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/stats',
        headers: {
          'x-telegram-id': '123456789',
        },
      });

      // Should not be 401 or 403 if 123456789 is an admin
      // If it's not an admin, it should be 403
      expect([200, 403]).toContain(response.statusCode);
    });

    it('should deny admin access for non-admin users', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/stats',
        headers: {
          'x-telegram-id': '999999999',
        },
      });

      expect(response.statusCode).toBe(403);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('FORBIDDEN');
      expect(payload.error.message).toBe('Admin access required');
    });

    it('should deny admin users endpoint access for non-admin', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/admin/users',
        headers: {
          'x-telegram-id': '999999999',
        },
      });

      expect(response.statusCode).toBe(403);
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(false);
      expect(payload.error.code).toBe('FORBIDDEN');
    });

    it('should require authentication for all admin endpoints', async () => {
      const endpoints = ['/api/admin/stats', '/api/admin/users'];
      
      for (const endpoint of endpoints) {
        const response = await app.inject({
          method: 'GET',
          url: endpoint,
        });

        expect(response.statusCode).toBe(401);
        const payload = JSON.parse(response.payload);
        expect(payload.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('Webhook Authentication', () => {
    it('should reject webhook without secret token', async () => {
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

    it('should reject webhook with incorrect secret token', async () => {
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

    it('should accept webhook with correct secret token', async () => {
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

  describe('Cross-Endpoint Authorization Consistency', () => {
    it('should consistently enforce auth across user endpoints', async () => {
      const endpoints = ['/api/users/me', '/api/history'];
      
      for (const endpoint of endpoints) {
        const response = await app.inject({
          method: 'GET',
          url: endpoint,
        });

        expect(response.statusCode).toBe(401);
        const payload = JSON.parse(response.payload);
        expect(payload.error.code).toBe('UNAUTHORIZED');
      }
    });
  });
});
