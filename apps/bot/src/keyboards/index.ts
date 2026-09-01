import { Markup } from 'telegraf';
import { CALLBACK_ACTIONS } from '@telegram-bot/shared';

export function setupKeyboards() {
  // Keyboards are exported as functions to be used in commands and handlers
}

export function getMainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔎 Main Feature', JSON.stringify({ action: CALLBACK_ACTIONS.MAIN_FEATURE }))],
    [Markup.button.callback('👤 My Profile', JSON.stringify({ action: CALLBACK_ACTIONS.PROFILE }))],
    [Markup.button.callback('📜 History', JSON.stringify({ action: CALLBACK_ACTIONS.HISTORY }))],
    [Markup.button.callback('⚙️ Settings', JSON.stringify({ action: CALLBACK_ACTIONS.SETTINGS }))],
    [Markup.button.callback('❓ Help', JSON.stringify({ action: CALLBACK_ACTIONS.HELP }))],
  ]);
}

export function getBackKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔙 Back', JSON.stringify({ action: CALLBACK_ACTIONS.MENU }))],
  ]);
}

export function getSettingsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔔 Notifications', JSON.stringify({ action: 'settings_notifications' }))],
    [Markup.button.callback('🌐 Language', JSON.stringify({ action: 'settings_language' }))],
    [Markup.button.callback('🔙 Back', JSON.stringify({ action: CALLBACK_ACTIONS.MENU }))],
  ]);
}

export function getAdminKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Stats', JSON.stringify({ action: 'admin_stats' }))],
    [Markup.button.callback('👥 Users', JSON.stringify({ action: 'admin_users' }))],
    [Markup.button.callback('📢 Broadcast', JSON.stringify({ action: 'admin_broadcast' }))],
    [Markup.button.callback('🔙 Back', JSON.stringify({ action: CALLBACK_ACTIONS.MENU }))],
  ]);
}
