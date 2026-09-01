import { prisma } from '@telegram-bot/database';
import { logger, CONVERSATION_STATES, SESSION_EXPIRY_MS } from '@telegram-bot/shared';

export class ConversationManager {
  private static instance: ConversationManager;

  private constructor() {}

  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  async createSession(userId: string, state: string, data?: Record<string, unknown>): Promise<void> {
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

    await prisma.session.create({
      data: {
        userId,
        state,
        data: data || {},
        expiresAt,
      },
    });

    logger.info({ userId, state }, 'Conversation session created');
  }

  async getSession(userId: string): Promise<{ state: string; data: Record<string, unknown> } | null> {
    const session = await prisma.session.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!session) {
      return null;
    }

    return {
      state: session.state,
      data: (session.data as Record<string, unknown>) || {},
    };
  }

  async updateSession(userId: string, state: string, data?: Record<string, unknown>): Promise<void> {
    const session = await prisma.session.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      await this.createSession(userId, state, data);
      return;
    }

    await prisma.session.update({
      where: { id: session.id },
      data: {
        state,
        data: data || session.data,
        updatedAt: new Date(),
      },
    });

    logger.info({ userId, state }, 'Conversation session updated');
  }

  async deleteSession(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });

    logger.info({ userId }, 'Conversation session deleted');
  }

  async cleanupExpiredSessions(): Promise<void> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    if (result.count > 0) {
      logger.info({ count: result.count }, 'Expired sessions cleaned up');
    }
  }

  async hasActiveConversation(userId: string): Promise<boolean> {
    const session = await this.getSession(userId);
    return session !== null && session.state !== CONVERSATION_STATES.IDLE;
  }
}

export const conversationManager = ConversationManager.getInstance();
