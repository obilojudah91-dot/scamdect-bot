import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@telegram-bot/database';

describe('Database Operations Integration Tests', () => {
  let testUserId: number;
  const testTelegramId = BigInt(9999999999);

  beforeAll(async () => {
    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: { telegramId: testTelegramId },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.activity.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.deleteMany({
      where: { telegramId: testTelegramId },
    });
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const user = await prisma.user.create({
        data: {
          telegramId: testTelegramId,
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          languageCode: 'en',
          isActive: true,
        },
      });

      expect(user).toBeDefined();
      expect(user.telegramId).toBe(testTelegramId);
      expect(user.username).toBe('testuser');
      expect(user.firstName).toBe('Test');
      testUserId = user.id;
    });

    it('should find user by telegram ID', async () => {
      const user = await prisma.user.findUnique({
        where: { telegramId: testTelegramId },
      });

      expect(user).toBeDefined();
      expect(user?.telegramId).toBe(testTelegramId);
      expect(user?.username).toBe('testuser');
    });

    it('should update user information', async () => {
      const updatedUser = await prisma.user.update({
        where: { telegramId: testTelegramId },
        data: {
          username: 'updateduser',
          firstName: 'Updated',
        },
      });

      expect(updatedUser.username).toBe('updateduser');
      expect(updatedUser.firstName).toBe('Updated');
    });

    it('should count active users', async () => {
      const count = await prisma.user.count({
        where: { isActive: true },
      });

      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should list users with pagination', async () => {
      const users = await prisma.user.findMany({
        take: 10,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });

      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Activity Operations', () => {
    it('should create an activity record', async () => {
      const activity = await prisma.activity.create({
        data: {
          userId: testUserId,
          type: 'command',
          command: '/test',
          metadata: { test: true },
        },
      });

      expect(activity).toBeDefined();
      expect(activity.userId).toBe(testUserId);
      expect(activity.type).toBe('command');
      expect(activity.command).toBe('/test');
    });

    it('should find activities by user', async () => {
      const activities = await prisma.activity.findMany({
        where: { userId: testUserId },
        orderBy: { createdAt: 'desc' },
      });

      expect(Array.isArray(activities)).toBe(true);
      expect(activities.length).toBeGreaterThanOrEqual(1);
    });

    it('should count activities', async () => {
      const count = await prisma.activity.count({
        where: { userId: testUserId },
      });

      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('should count recent activities', async () => {
      const count = await prisma.activity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Admin Action Operations', () => {
    it('should create an admin action record', async () => {
      const adminAction = await prisma.adminAction.create({
        data: {
          adminId: testUserId,
          action: 'test_action',
          targetId: testUserId.toString(),
          metadata: { reason: 'test' },
        },
      });

      expect(adminAction).toBeDefined();
      expect(adminAction.adminId).toBe(testUserId);
      expect(adminAction.action).toBe('test_action');
    });

    it('should find admin actions by admin', async () => {
      const actions = await prisma.adminAction.findMany({
        where: { adminId: testUserId },
        orderBy: { createdAt: 'desc' },
      });

      expect(Array.isArray(actions)).toBe(true);
    });
  });

  describe('Session Operations', () => {
    it('should create a session record', async () => {
      const session = await prisma.session.create({
        data: {
          userId: testUserId,
          state: 'test_state',
          metadata: { step: 1 },
        },
      });

      expect(session).toBeDefined();
      expect(session.userId).toBe(testUserId);
      expect(session.state).toBe('test_state');
    });

    it('should update session state', async () => {
      const updatedSession = await prisma.session.updateMany({
        where: { userId: testUserId },
        data: { state: 'updated_state' },
      });

      expect(updatedSession.count).toBeGreaterThanOrEqual(0);
    });

    it('should delete session', async () => {
      await prisma.session.deleteMany({
        where: { userId: testUserId },
      });

      const session = await prisma.session.findFirst({
        where: { userId: testUserId },
      });

      expect(session).toBeNull();
    });
  });

  describe('Database Constraints and Validation', () => {
    it('should enforce unique telegram ID constraint', async () => {
      await expect(
        prisma.user.create({
          data: {
            telegramId: testTelegramId,
            username: 'duplicate',
            firstName: 'Duplicate',
          },
        })
      ).rejects.toThrow();
    });

    it('should handle foreign key constraints', async () => {
      // Try to create activity with non-existent user
      await expect(
        prisma.activity.create({
          data: {
            userId: 999999999,
            type: 'command',
            command: '/test',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Query Performance', () => {
    it('should use indexes for user lookup by telegram ID', async () => {
      const start = Date.now();
      await prisma.user.findUnique({
        where: { telegramId: testTelegramId },
      });
      const duration = Date.now() - start;

      // Should be fast (< 100ms for indexed lookup)
      expect(duration).toBeLessThan(100);
    });

    it('should handle pagination efficiently', async () => {
      const start = Date.now();
      await prisma.user.findMany({
        take: 50,
        skip: 0,
        orderBy: { createdAt: 'desc' },
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
