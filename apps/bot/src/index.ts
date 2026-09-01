import { Telegraf } from 'telegraf';
import { env } from '@telegram-bot/config';
import { logger } from '@telegram-bot/shared';
import { setupMiddleware } from './middleware';
import { setupCommands } from './commands';
import { setupHandlers } from './handlers';

const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

async function startBot() {
  try {
    logger.info('Starting Telegram bot...');

    setupMiddleware(bot);
    setupCommands(bot);
    setupHandlers(bot);

    if (env.NODE_ENV === 'production') {
      await bot.launch({
        webhook: {
          domain: env.API_URL,
          secretToken: env.TELEGRAM_WEBHOOK_SECRET,
        },
      });
      logger.info('Bot started with webhook');
    } else {
      await bot.launch();
      logger.info('Bot started with polling');
    }

    logger.info('Bot is running');
  } catch (error) {
    logger.error({ error }, 'Failed to start bot');
    process.exit(1);
  }
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

startBot();
