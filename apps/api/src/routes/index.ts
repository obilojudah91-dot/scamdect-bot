import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health';
import { userRoutes } from './users';
import { telegramWebhookRoutes } from './webhook';
import { adminRoutes } from './admin';

export function setupRoutes(fastify: FastifyInstance) {
  healthRoutes(fastify);
  userRoutes(fastify);
  telegramWebhookRoutes(fastify);
  adminRoutes(fastify);
}
