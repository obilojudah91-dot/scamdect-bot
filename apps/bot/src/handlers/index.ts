import { Telegraf } from 'telegraf';
import { logger, CALLBACK_ACTIONS, callbackDataSchema } from '@telegram-bot/shared';
import { getMainMenuKeyboard, getBackKeyboard, getSettingsKeyboard } from '../keyboards';

export function setupHandlers(bot: Telegraf) {
  bot.on('callback_query', handleCallbackQuery);
}

async function handleCallbackQuery(ctx: any) {
  const { botContext } = ctx;
  
  if (!ctx.callbackQuery || !ctx.callbackQuery.data) {
    await ctx.answerCbQuery();
    return;
  }

  try {
    const data = JSON.parse(ctx.callbackQuery.data);
    const validationResult = callbackDataSchema.safeParse(data);
    
    if (!validationResult.success) {
      logger.warn({ error: validationResult.error }, 'Invalid callback data');
      await ctx.answerCbQuery('Invalid request');
      return;
    }
    
    const action = validationResult.data.action;

    switch (action) {
      case CALLBACK_ACTIONS.MENU:
        await handleMenu(ctx);
        break;
      case CALLBACK_ACTIONS.PROFILE:
        await handleProfile(ctx);
        break;
      case CALLBACK_ACTIONS.HISTORY:
        await handleHistory(ctx);
        break;
      case CALLBACK_ACTIONS.SETTINGS:
        await handleSettings(ctx);
        break;
      case CALLBACK_ACTIONS.HELP:
        await handleHelp(ctx);
        break;
      case CALLBACK_ACTIONS.MAIN_FEATURE:
        await handleMainFeature(ctx);
        break;
      case CALLBACK_ACTIONS.BACK:
        await handleMenu(ctx);
        break;
      case 'settings_notifications':
        await handleSettingsNotifications(ctx);
        break;
      case 'settings_language':
        await handleSettingsLanguage(ctx);
        break;
      case 'admin_stats':
        if (botContext?.isAdmin) {
          await handleAdminStats(ctx);
        } else {
          await ctx.answerCbQuery('⚠️ Access denied');
        }
        break;
      case 'admin_users':
        if (botContext?.isAdmin) {
          await handleAdminUsers(ctx);
        } else {
          await ctx.answerCbQuery('⚠️ Access denied');
        }
        break;
      case 'admin_broadcast':
        if (botContext?.isAdmin) {
          await handleAdminBroadcast(ctx);
        } else {
          await ctx.answerCbQuery('⚠️ Access denied');
        }
        break;
      default:
        await ctx.answerCbQuery('Unknown action');
    }

    await ctx.answerCbQuery();
    logger.info({ action, telegramId: botContext?.telegramId.toString() }, 'Callback query handled');
  } catch (error) {
    logger.error({ error }, 'Error handling callback query');
    await ctx.answerCbQuery('Error processing request');
  }
}

async function handleMenu(ctx: any) {
  await ctx.editMessageText('📋 Main Menu:', {
    reply_markup: getMainMenuKeyboard(),
  });
}

async function handleProfile(ctx: any) {
  const { botContext } = ctx;
  
  const profileMessage = `
👤 *Your Profile*

Username: ${botContext?.username || 'Not set'}
Telegram ID: ${botContext?.telegramId}
Status: ${botContext?.isAdmin ? '✅ Admin' : '👤 User'}
  `.trim();

  await ctx.editMessageText(profileMessage, {
    parse_mode: 'Markdown',
    reply_markup: getBackKeyboard(),
  });
}

async function handleHistory(ctx: any) {
  await ctx.editMessageText('📜 Your recent activity will be shown here.', {
    reply_markup: getBackKeyboard(),
  });
}

async function handleSettings(ctx: any) {
  await ctx.editMessageText('⚙️ Settings', {
    reply_markup: getSettingsKeyboard(),
  });
}

async function handleHelp(ctx: any) {
  const helpMessage = `
📖 *Help*

Available commands:
/start - Start the bot and see the main menu
/help - Show this help message
/menu - Show the main menu
/profile - View your profile
/history - View your activity history
/settings - Configure your settings

Use the buttons below for quick navigation.
  `.trim();

  await ctx.editMessageText(helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: getMainMenuKeyboard(),
  });
}

async function handleMainFeature(ctx: any) {
  await ctx.editMessageText('🔎 Main Feature\n\nThis feature will be implemented soon.', {
    reply_markup: getBackKeyboard(),
  });
}

async function handleSettingsNotifications(ctx: any) {
  await ctx.editMessageText('🔔 Notifications\n\nNotification settings will be available soon.', {
    reply_markup: getSettingsKeyboard(),
  });
}

async function handleSettingsLanguage(ctx: any) {
  await ctx.editMessageText('🌐 Language\n\nLanguage settings will be available soon.', {
    reply_markup: getSettingsKeyboard(),
  });
}

async function handleAdminStats(ctx: any) {
  await ctx.editMessageText('📊 Admin Stats\n\nStatistics will be shown here.', {
    reply_markup: getMainMenuKeyboard(),
  });
}

async function handleAdminUsers(ctx: any) {
  await ctx.editMessageText('👥 Admin Users\n\nUser management will be available here.', {
    reply_markup: getMainMenuKeyboard(),
  });
}

async function handleAdminBroadcast(ctx: any) {
  await ctx.editMessageText('📢 Admin Broadcast\n\nBroadcast feature will be available here.', {
    reply_markup: getMainMenuKeyboard(),
  });
}
