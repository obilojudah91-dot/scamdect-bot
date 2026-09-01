import { describe, it, expect } from 'vitest';
import {
  CALLBACK_ACTIONS,
  CONVERSATION_STATES,
  ACTIVITY_TYPES,
  ERROR_CODES,
  SESSION_EXPIRY_MS,
  MAX_MESSAGE_LENGTH,
  RATE_LIMITS,
} from '@telegram-bot/shared/src/constants';

describe('Constants', () => {
  describe('CALLBACK_ACTIONS', () => {
    it('should have required callback actions', () => {
      expect(CALLBACK_ACTIONS.MENU).toBeDefined();
      expect(CALLBACK_ACTIONS.PROFILE).toBeDefined();
      expect(CALLBACK_ACTIONS.HISTORY).toBeDefined();
      expect(CALLBACK_ACTIONS.SETTINGS).toBeDefined();
      expect(CALLBACK_ACTIONS.HELP).toBeDefined();
      expect(CALLBACK_ACTIONS.MAIN_FEATURE).toBeDefined();
      expect(CALLBACK_ACTIONS.BACK).toBeDefined();
    });
  });

  describe('CONVERSATION_STATES', () => {
    it('should have required conversation states', () => {
      expect(CONVERSATION_STATES.IDLE).toBeDefined();
      expect(CONVERSATION_STATES.AWAITING_INPUT).toBeDefined();
      expect(CONVERSATION_STATES.PROCESSING).toBeDefined();
    });
  });

  describe('ACTIVITY_TYPES', () => {
    it('should have required activity types', () => {
      expect(ACTIVITY_TYPES.COMMAND).toBeDefined();
      expect(ACTIVITY_TYPES.CALLBACK_QUERY).toBeDefined();
      expect(ACTIVITY_TYPES.MESSAGE).toBeDefined();
      expect(ACTIVITY_TYPES.ERROR).toBeDefined();
    });
  });

  describe('ERROR_CODES', () => {
    it('should have required error codes', () => {
      expect(ERROR_CODES.UNAUTHORIZED).toBeDefined();
      expect(ERROR_CODES.FORBIDDEN).toBeDefined();
      expect(ERROR_CODES.NOT_FOUND).toBeDefined();
      expect(ERROR_CODES.VALIDATION_ERROR).toBeDefined();
      expect(ERROR_CODES.RATE_LIMIT_EXCEEDED).toBeDefined();
      expect(ERROR_CODES.INTERNAL_ERROR).toBeDefined();
      expect(ERROR_CODES.TELEGRAM_API_ERROR).toBeDefined();
      expect(ERROR_CODES.DATABASE_ERROR).toBeDefined();
    });
  });

  describe('Numeric constants', () => {
    it('should have valid session expiry', () => {
      expect(SESSION_EXPIRY_MS).toBeGreaterThan(0);
      expect(SESSION_EXPIRY_MS).toBe(30 * 60 * 1000); // 30 minutes
    });

    it('should have valid max message length', () => {
      expect(MAX_MESSAGE_LENGTH).toBe(4096);
    });
  });

  describe('RATE_LIMITS', () => {
    it('should have rate limit configuration', () => {
      expect(RATE_LIMITS.COMMANDS).toBeDefined();
      expect(RATE_LIMITS.CALLBACKS).toBeDefined();
      expect(RATE_LIMITS.MESSAGES).toBeDefined();

      expect(RATE_LIMITS.COMMANDS.windowMs).toBeGreaterThan(0);
      expect(RATE_LIMITS.COMMANDS.max).toBeGreaterThan(0);
    });
  });
});
