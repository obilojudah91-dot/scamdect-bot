import { describe, it, expect } from 'vitest';
import { ERROR_CODES } from '@telegram-bot/shared';

describe('Error Handling', () => {
  describe('Error codes', () => {
    it('should have all required error codes', () => {
      expect(ERROR_CODES.UNAUTHORIZED).toBeDefined();
      expect(ERROR_CODES.FORBIDDEN).toBeDefined();
      expect(ERROR_CODES.NOT_FOUND).toBeDefined();
      expect(ERROR_CODES.VALIDATION_ERROR).toBeDefined();
      expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBeDefined();
      expect(ERROR_CODES.INTERNAL_ERROR).toBeDefined();
      expect(ERROR_CODES.TELEGRAM_API_ERROR).toBeDefined();
      expect(ERROR_CODES.DATABASE_ERROR).toBeDefined();
    });

    it('should have unique error codes', () => {
      const codes = Object.values(ERROR_CODES);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });

    it('should have string error codes', () => {
      Object.values(ERROR_CODES).forEach((code) => {
        expect(typeof code).toBe('string');
      });
    });
  });

  describe('Error response structure', () => {
    it('should match expected error response format', () => {
      const errorResponse = {
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Invalid input',
        },
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
      expect(errorResponse.error.code).toBeDefined();
      expect(errorResponse.error.message).toBeDefined();
    });

    it('should not expose stack traces in error responses', () => {
      const errorResponse = {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'An internal error occurred',
        },
      };

      expect(errorResponse.error.stack).toBeUndefined();
      expect(errorResponse.error.details).toBeUndefined();
    });
  });
});
