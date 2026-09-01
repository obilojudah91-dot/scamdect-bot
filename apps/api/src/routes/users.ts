import { FastifyInstance } from 'fastify';
import { prisma } from '@telegram-bot/database';
import { logger, ERROR_CODES, userDtoSchema } from '@telegram-bot/shared';

interface FastifyRequestWithUser {
  user?: { telegramId: bigint };
}

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/api/users/me', {
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
      
      (request as FastifyRequestWithUser).user = { telegramId: BigInt(telegramId) };
    },
  }, async (request, reply) => {
    try {
      const { telegramId } = (request as FastifyRequestWithUser).user!;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        reply.status(404).send({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: 'User not found',
          },
        });
        return;
      }

      const userDto = userDtoSchema.parse({
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        languageCode: user.languageCode,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      return {
        success: true,
        data: userDto,
      };
    } catch (error) {
      logger.error({ error, requestId: request.id }, 'Error fetching user');
      reply.status(500).send({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to fetch user',
        },
      });
      return;
    }
  });

  fastify.get('/api/history', {
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
      
      (request as FastifyRequestWithUser).user = { telegramId: BigInt(telegramId) };
    },
  }, async (request, reply) => {
    try {
      const { telegramId } = (request as FastifyRequestWithUser).user!;

      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        reply.status(404).send({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: 'User not found',
          },
        });
        return;
      }

      const activities = await prisma.activity.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return {
        success: true,
        data: {
          activities: activities.map((activity: any) => ({
            id: activity.id,
            type: activity.type,
            command: activity.command,
            metadata: activity.metadata,
            createdAt: activity.createdAt,
          })),
        },
      };
    } catch (error) {
      logger.error({ error, requestId: request.id }, 'Error fetching history');
      reply.status(500).send({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to fetch history',
        },
      });
      return;
    }
  });
}
