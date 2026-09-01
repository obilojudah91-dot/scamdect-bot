import { Telegraf } from 'telegraf';
import { logger } from '@telegram-bot/shared';
import { getMainMenuKeyboard } from '../keyboards';

export function setupCommands(bot: Telegraf) {
  bot.start(startCommand);
  bot.help(helpCommand);
  bot.command('menu', menuCommand);
  bot.command('profile', profileCommand);
  bot.command('history', historyCommand);
  bot.command('settings', settingsCommand);
}

async function startCommand(ctx: any) {
  const { botContext } = ctx;
  
  const welcomeMessage = `
👋 Welcome to the Telegram Bot!

I'm here to help you with various features. Use the menu below to get started.

${botContext?.isAdmin ? '🔑 You have admin privileges.' : ''}
  `.trim();

  await ctx.reply(welcomeMessage, {
    reply_markup: getMainMenuKeyboard(),
  });

  logger.info({ telegramId: botContext?.telegramId.toString() }, 'Start command executed');
}

async function helpCommand(ctx: any) {
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

  await ctx.reply(helpMessage, {
    parse_mode: 'Markdown',
    reply_markup: getMainMenuKeyboard(),
  });

  logger.info({ telegramId: ctx.botContext?.telegramId.toString() }, 'Help command executed');
}

async function menuCommand(ctx: any) {
  await ctx.reply('📋 Main Menu:', {
    reply_markup: getMainMenuKeyboard(),
  });

  logger.info({ telegramId: ctx.botContext?.telegramId.toString() }, 'Menu command executed');
}

async function profileCommand(ctx: any) {
  const { botContext } = ctx;
  
  if (!botContext) {
    await ctx.reply('Unable to retrieve profile information.');
    return;
  }

  const profileMessage = `
👤 *Your Profile*

Username: ${botContext.username || 'Not set'}
Telegram ID: ${botContext.telegramId}
Status: ${botContext.isAdmin ? '✅ Admin' : '👤 User'}
  `.trim();

  await ctx.reply(profileMessage, {
    parse_mode: 'Markdown',
    reply_markup: getMainMenuKeyboard(),
  });

  logger.info({ telegramId: botContext.telegramId.toString() }, 'Profile command executed');
}

async function historyCommand(ctx: any) {
  const { botContext } = ctx;
  
  if (!botContext) {
    await ctx.reply('Unable to retrieve history.');
    return;
  }

  await ctx.reply('📜 Your recent activity will be shown here.', {
    reply_markup: getMainMenuKeyboard(),
  });

  logger.info({ telegramId: botContext.telegramId.toString() }, 'History command executed');
}

async function settingsCommand(ctx: any) {
  const { botContext } = ctx;
  
  if (!botContext) {
    await ctx.reply('Unable to access settings.');
    return;
  }

  await ctx.reply('⚙️ Settings will be available here.', {
    reply_markup: getMainMenuKeyboard(),
  });

  logger.info({ telegramId: botContext.telegramId.toString() }, 'Settings command executed');
}
