import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async () => {
    return {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      },
    };
  });

  fastify.get('/readiness', async () => {
    return {
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
    };
  });
}
