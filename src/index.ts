import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDb, disconnectDb } from "./db/client.js";
import { createBot } from "./bot/bot.js";
import { createHealthServer } from "./server/health.js";
import { LocalDbProvider } from "./intelligence/providers/LocalDbProvider.js";

async function main() {
  await connectDb();

  const provider = new LocalDbProvider();

  const bot = createBot(provider);
  const healthApp = createHealthServer();

  const server = healthApp.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Health server listening");
  });

  if (env.TELEGRAM_USE_WEBHOOK) {
    await bot.telegram.setWebhook(env.TELEGRAM_WEBHOOK_URL!, {
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
    });
    healthApp.use(await bot.createWebhook({ domain: env.TELEGRAM_WEBHOOK_URL! }));
    logger.info("Bot running in webhook mode");
  } else {
    await bot.launch();
    logger.info("Bot running in polling mode");
  }

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    bot.stop(signal);
    server.close();
    await disconnectDb();
    process.exit(0);
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
