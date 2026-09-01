import { Middleware } from 'telegraf';
import { Context } from 'telegraf';
import { env } from '@telegram-bot/config';
import { prisma } from '@telegram-bot/database';
import { logger, BotContext } from '@telegram-bot/shared';
import { ACTIVITY_TYPES } from '@telegram-bot/shared';

interface CustomContext extends Context {
  botContext?: BotContext;
}

export function setupMiddleware(bot: any) {
  bot.use(userRegistrationMiddleware());
  bot.use(activityLoggingMiddleware());
  bot.use(errorHandlingMiddleware());
}

function userRegistrationMiddleware(): Middleware<CustomContext> {
  return async (ctx, next) => {
    if (!ctx.from) {
      return next();
    }

    try {
      const telegramId = BigInt(ctx.from.id);
      
      let user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId,
            username: ctx.from.username,
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            languageCode: ctx.from.language_code,
          },
        });
        logger.info({ telegramId: telegramId.toString() }, 'New user registered');
      } else {
        user = await prisma.user.update({
          where: { telegramId },
          data: {
            username: ctx.from.username,
            firstName: ctx.from.first_name,
            lastName: ctx.from.last_name,
            languageCode: ctx.from.language_code,
            updatedAt: new Date(),
          },
        });
      }

      const isAdmin = env.ADMIN_TELEGRAM_IDS.includes(telegramId);

      ctx.botContext = {
        userId: user.id,
        telegramId,
        username: user.username,
        isAdmin,
      };
    } catch (error) {
      logger.error({ error }, 'Error in user registration middleware');
    }

    return next();
  };
}

function activityLoggingMiddleware(): Middleware<CustomContext> {
  return async (ctx, next) => {
    const startTime = Date.now();

    await next();

    if (!ctx.botContext) {
      return;
    }

    try {
      const duration = Date.now() - startTime;
      let type: string = ACTIVITY_TYPES.MESSAGE;
      let command: string | undefined;

      if (ctx.message && 'text' in ctx.message) {
        const text = ctx.message.text;
        if (text.startsWith('/')) {
          type = ACTIVITY_TYPES.COMMAND;
          command = text.split(' ')[0];
        }
      } else if (ctx.callbackQuery) {
        type = ACTIVITY_TYPES.CALLBACK_QUERY;
      }

      await prisma.activity.create({
        data: {
          userId: ctx.botContext.userId,
          type,
          command,
          metadata: { duration },
        },
      });
    } catch (error) {
      logger.error({ error }, 'Error logging activity');
    }
  };
}

function errorHandlingMiddleware(): Middleware<CustomContext> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      logger.error({ error, ctx: { update: ctx.update } }, 'Error in bot middleware');

      if (ctx.botContext) {
        try {
          await prisma.activity.create({
            data: {
              userId: ctx.botContext.userId,
              type: ACTIVITY_TYPES.ERROR,
              metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          });
        } catch (logError) {
          logger.error({ error: logError }, 'Failed to log error activity');
        }
      }

      const errorMessage = 'Something went wrong while processing your request. Please try again.';
      
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery();
      }
      
      if (ctx.chat) {
        await ctx.reply(errorMessage);
      }
    }
  };
}
