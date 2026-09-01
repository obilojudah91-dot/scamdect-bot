import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { env } from '@telegram-bot/config';
import { logger } from '@telegram-bot/shared';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';

const fastify = Fastify({
  logger: false,
  trustProxy: true,
  bodyLimit: 1 * 1024 * 1024, // 1MB default body limit
  maxParamLength: 1000, // Limit URL parameter length
});

// Register CORS with specific origin
fastify.register(cors, {
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-id', 'x-telegram-bot-api-secret-token'],
});

// Register security headers
fastify.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
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
