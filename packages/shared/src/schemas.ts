import { z } from 'zod';

export const telegramUserSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  language_code: z.string().optional(),
});

export const userDtoSchema = z.object({
  id: z.string(),
  telegramId: z.string(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  languageCode: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const sessionDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  state: z.string(),
  data: z.record(z.unknown()).optional(),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const activityDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  command: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export const adminActionDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.string(),
  targetId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }).optional(),
});

export const callbackDataSchema = z.object({
  action: z.string(),
  params: z.record(z.string()).optional(),
});

export const conversationStateSchema = z.enum(['idle', 'awaiting_input', 'processing']);
