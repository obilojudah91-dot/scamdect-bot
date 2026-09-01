import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Telegraf } from 'telegraf';
import { setupHandlers } from '../../apps/bot/src/handlers';
import { CALLBACK_ACTIONS } from '@telegram-bot/shared';

describe('Telegram Bot Handlers Integration Tests', () => {
  let bot: Telegraf;
  let mockContext: any;

  beforeAll(() => {
    bot = new Telegraf('test_token');
    setupHandlers(bot);
  });

  afterAll(() => {
    // Cleanup if needed
  });

  describe('Callback Query Handler', () => {
    it('should handle valid callback data', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ action: CALLBACK_ACTIONS.MENU }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalled();
    });

    it('should reject invalid callback data format', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: 'invalid_json',
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalledWith('Error processing request');
    });

    it('should reject callback data without action field', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ otherField: 'value' }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalledWith('Invalid request');
    });

    it('should handle profile callback action', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ action: CALLBACK_ACTIONS.PROFILE }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalled();
    });

    it('should handle history callback action', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ action: CALLBACK_ACTIONS.HISTORY }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalled();
    });

    it('should handle settings callback action', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ action: CALLBACK_ACTIONS.SETTINGS }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalled();
    });

    it('should handle help callback action', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ action: CALLBACK_ACTIONS.HELP }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalled();
    });

    it('should handle missing callback query gracefully', async () => {
      mockContext = {
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({});

      // Should not throw error
      expect(mockContext.answerCbQuery).not.toHaveBeenCalled();
    });

    it('should handle missing callback data gracefully', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalled();
    });
  });

  describe('Callback Data Validation', () => {
    it('should validate action is a string', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ action: 123 }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalledWith('Invalid request');
    });

    it('should handle empty action string', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ action: '' }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockResolvedValue(true),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      // Should handle gracefully
      expect(mockContext.answerCbQuery).toHaveBeenCalled();
    });
  });

  describe('Error Handling in Handlers', () => {
    it('should handle errors in callback processing', async () => {
      mockContext = {
        callbackQuery: {
          id: 'test_callback_id',
          data: JSON.stringify({ action: CALLBACK_ACTIONS.MENU }),
        },
        botContext: {
          telegramId: BigInt(123456789),
        },
        answerCbQuery: jest.fn().mockRejectedValue(new Error('Network error')),
      };

      await bot.handleUpdate({
        callback_query: mockContext.callbackQuery,
      });

      expect(mockContext.answerCbQuery).toHaveBeenCalled();
    });
  });
});
