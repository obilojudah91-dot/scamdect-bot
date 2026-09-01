export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

export interface UserDTO {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDTO {
  id: string;
  userId: string;
  state: string;
  data?: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDTO {
  id: string;
  userId: string;
  type: string;
  command?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface AdminActionDTO {
  id: string;
  userId: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface BotContext {
  userId: string;
  telegramId: bigint;
  username?: string;
  isAdmin: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ConversationState = 
  | 'idle'
  | 'awaiting_input'
  | 'processing';

export type ActivityType = 
  | 'command'
  | 'callback_query'
  | 'message'
  | 'error';
