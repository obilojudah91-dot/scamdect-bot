export const CALLBACK_ACTIONS = {
  MENU: 'menu',
  PROFILE: 'profile',
  HISTORY: 'history',
  SETTINGS: 'settings',
  HELP: 'help',
  MAIN_FEATURE: 'main_feature',
  BACK: 'back',
} as const;

export const CONVERSATION_STATES = {
  IDLE: 'idle',
  AWAITING_INPUT: 'awaiting_input',
  PROCESSING: 'processing',
} as const;

export const ACTIVITY_TYPES = {
  COMMAND: 'command',
  CALLBACK_QUERY: 'callback_query',
  MESSAGE: 'message',
  ERROR: 'error',
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TELEGRAM_API_ERROR: 'TELEGRAM_API_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export const SESSION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

export const MAX_MESSAGE_LENGTH = 4096;

export const RATE_LIMITS = {
  COMMANDS: { windowMs: 60000, max: 20 },
  CALLBACKS: { windowMs: 60000, max: 50 },
  MESSAGES: { windowMs: 60000, max: 30 },
} as const;
