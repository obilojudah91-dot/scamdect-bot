import type { Context, MiddlewareFn } from "telegraf";
import { logger } from "../../config/logger.js";

export const errorHandlerMiddleware: MiddlewareFn<Context> = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error(
      { err, userId: ctx.from?.id, updateType: ctx.updateType },
      "Unhandled error in bot handler"
    );

    const friendlyMessage = "⚠️ I couldn't complete that action right now. Please try again in a moment.";

    try {
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery("Something went wrong.", { show_alert: true });
      } else {
        await ctx.reply(friendlyMessage);
      }
    } catch (replyErr) {
      logger.error({ err: replyErr }, "Failed to send error message to user");
    }
  }
};
