import { FastifyInstance } from 'fastify';
import { prisma } from '@telegram-bot/database';
import { env } from '@telegram-bot/config';
import { logger, ERROR_CODES } from '@telegram-bot/shared';

interface FastifyRequestWithUser {
  user?: { telegramId: bigint };
}

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.get('/api/admin/stats', {
    preHandler: async (request, reply) => {
      const telegramId = (request.headers['x-telegram-id'] as string);
      if (!telegramId) {
        reply.status(401).send({
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Missing Telegram ID',
          },
        });
        return reply;
      }
      
      // Validate telegramId is a valid number string
      if (!/^\d+$/.test(telegramId)) {
        reply.status(400).send({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid Telegram ID format',
          },
        });
        return reply;
      }

      const adminTelegramId = BigInt(telegramId);
      if (!env.ADMIN_TELEGRAM_IDS.includes(adminTelegramId)) {
        reply.status(403).send({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Admin access required',
          },
        });
        return reply;
      }

      (request as FastifyRequestWithUser).user = { telegramId: adminTelegramId };
    },
  }, async (request, reply) => {
    try {
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: { isActive: true },
      });
      const totalActivities = await prisma.activity.count();
      const recentActivities = await prisma.activity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      return {
        success: true,
        data: {
          totalUsers,
          activeUsers,
          totalActivities,
          recentActivities,
        },
      };
    } catch (error) {
      logger.error({ error, requestId: request.id }, 'Error fetching admin stats');
      reply.status(500).send({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to fetch stats',
        },
      });
      return;
    }
  });

  fastify.get('/api/admin/users', {
    preHandler: async (request, reply) => {
      const telegramId = (request.headers['x-telegram-id'] as string);
      if (!telegramId) {
        reply.status(401).send({
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: 'Missing Telegram ID',
          },
        });
        return reply;
      }
      
      // Validate telegramId is a valid number string
      if (!/^\d+$/.test(telegramId)) {
        reply.status(400).send({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid Telegram ID format',
          },
        });
        return reply;
      }

      const adminTelegramId = BigInt(telegramId);
      if (!env.ADMIN_TELEGRAM_IDS.includes(adminTelegramId)) {
        reply.status(403).send({
          success: false,
          error: {
            code: ERROR_CODES.FORBIDDEN,
            message: 'Admin access required',
          },
        });
        return reply;
      }

      (request as FastifyRequestWithUser).user = { telegramId: adminTelegramId };
    },
  }, async (request, reply) => {
    try {
      const page = parseInt((request.query as any).page || '1', 10);
      const limit = Math.min(parseInt((request.query as any).limit || '50', 10), 100); // Cap at 100
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
      ]);

      return {
        success: true,
        data: {
          users: users.map((user: any) => ({
            id: user.id,
            telegramId: user.telegramId.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            createdAt: user.createdAt,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      logger.error({ error, requestId: request.id }, 'Error fetching admin users');
      reply.status(500).send({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to fetch users',
        },
      });
      return;
    }
  });
}
