import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationManager } from '@telegram-bot/bot/src/conversations';

describe('ConversationManager', () => {
  let conversationManager: ConversationManager;

  beforeEach(() => {
    conversationManager = ConversationManager.getInstance();
  });

  it('should return singleton instance', () => {
    const instance1 = ConversationManager.getInstance();
    const instance2 = ConversationManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should have createSession method', () => {
    expect(typeof conversationManager.createSession).toBe('function');
  });

  it('should have getSession method', () => {
    expect(typeof conversationManager.getSession).toBe('function');
  });

  it('should have updateSession method', () => {
    expect(typeof conversationManager.updateSession).toBe('function');
  });

  it('should have deleteSession method', () => {
    expect(typeof conversationManager.deleteSession).toBe('function');
  });

  it('should hasActiveConversation method', () => {
    expect(typeof conversationManager.hasActiveConversation).toBe('function');
  });
});
