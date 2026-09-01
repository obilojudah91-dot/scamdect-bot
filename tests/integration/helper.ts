import Fastify from 'fastify';
import { setupRoutes } from '../../apps/api/src/routes';
import { setupMiddleware } from '../../apps/api/src/middleware';

export function build() {
  const app = Fastify();

  setupMiddleware(app);
  setupRoutes(app);

  return app;
}
