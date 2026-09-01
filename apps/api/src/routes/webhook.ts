import { FastifyInstance } from 'fastify';
import { env } from '@telegram-bot/config';
import { logger, ERROR_CODES } from '@telegram-bot/shared';

export async function telegramWebhookRoutes(fastify: FastifyInstance) {
  fastify.post('/telegram/webhook', {
    config: {
      rateLimit: {
        max: 100,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    const secretToken = request.headers['x-telegram-bot-api-secret-token'] as string;

    if (secretToken !== env.TELEGRAM_WEBHOOK_SECRET) {
      logger.warn({ secretToken: '***' }, 'Invalid webhook secret');
      reply.status(401).send({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Invalid webhook secret',
        },
      });
      return reply;
    }

    try {
      const update = request.body as any;

      logger.info({
        updateId: update.update_id,
        type: update.message ? 'message' : update.callback_query ? 'callback_query' : 'unknown',
      }, 'Received Telegram webhook update');

      reply.status(200).send({ success: true });

      // Process the update asynchronously
      // This would typically be handled by the bot instance
      // For now, we acknowledge receipt
    } catch (error) {
      logger.error({ error, requestId: request.id }, 'Error processing webhook');
      reply.status(500).send({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Failed to process webhook',
        },
      });
    }
  });
}
