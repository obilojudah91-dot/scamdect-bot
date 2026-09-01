import { FastifyInstance } from 'fastify';
import { recordHealthCheck } from '@telegram-bot/shared';

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint - intentionally public for monitoring/deployment
  // Does not expose sensitive data, only service status
  fastify.get('/health', async () => {
    recordHealthCheck('healthy');
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    };
  });

  // Readiness check endpoint - intentionally public for Kubernetes/deployment probes
  // Does not expose sensitive data, only service readiness
  fastify.get('/readiness', async () => {
    recordHealthCheck('healthy');
    return {
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    };
  });
}
