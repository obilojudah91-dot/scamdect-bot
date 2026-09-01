import Fastify from 'fastify';
import { env } from '@telegram-bot/config';
import { logger } from '@telegram-bot/shared';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';

const fastify = Fastify({
  logger: false,
  trustProxy: true,
  bodyLimit: 10 * 1024 * 1024, // 10MB
});

async function startServer() {
  try {
    setupMiddleware(fastify);
    setupRoutes(fastify);

    await fastify.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    logger.info(`API server listening on port ${env.PORT}`);
  } catch (error) {
    logger.error({ error }, 'Failed to start API server');
    process.exit(1);
  }
}

startServer();
