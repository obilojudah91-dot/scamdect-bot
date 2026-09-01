import { FastifyInstance } from 'fastify';
import { logger, ERROR_CODES } from '@telegram-bot/shared';
import { setupRateLimit } from './rateLimit';

export function setupMiddleware(fastify: FastifyInstance) {
  setupRateLimit(fastify);
  fastify.addHook('onRequest', async (request) => {
    request.id = generateRequestId();
  });

  fastify.addHook('onResponse', async (request, reply) => {
    logger.info({
      requestId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
    }, 'API request completed');
  });

  fastify.addHook('onError', async (request, reply, error) => {
    logger.error({
      requestId: request.id,
      error,
      url: request.url,
      method: request.method,
    }, 'API request error');

    if (!reply.sent) {
      reply.status(500).send({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'An internal error occurred',
        },
      });
    }
  });

  fastify.setErrorHandler((error, request, reply) => {
    logger.error({
      requestId: request.id,
      error,
      url: request.url,
      method: request.method,
    }, 'Unhandled error');

    reply.status(500).send({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'An internal error occurred',
      },
    });
  });

  fastify.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: 'Endpoint not found',
      },
    });
  });
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
