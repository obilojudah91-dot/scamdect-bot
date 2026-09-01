import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { callbackDataSchema, conversationStateSchema } from '@telegram-bot/shared/src/schemas';

describe('Validation Schemas', () => {
  describe('callbackDataSchema', () => {
    it('should validate valid callback data', () => {
      const validData = {
        action: 'menu',
        params: { id: '123' },
      };
      const result = callbackDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate callback data without params', () => {
      const validData = {
        action: 'menu',
      };
      const result = callbackDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid callback data', () => {
      const invalidData = {
        action: 123,
      };
      const result = callbackDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject callback data without action', () => {
      const invalidData = {
        params: { id: '123' },
      };
      const result = callbackDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('conversationStateSchema', () => {
    it('should validate valid conversation states', () => {
      const validStates = ['idle', 'awaiting_input', 'processing'];
      validStates.forEach((state) => {
        const result = conversationStateSchema.safeParse(state);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid conversation states', () => {
      const invalidState = 'invalid_state';
      const result = conversationStateSchema.safeParse(invalidState);
      expect(result.success).toBe(false);
    });
  });
});
