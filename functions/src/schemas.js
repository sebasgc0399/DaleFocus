import { z } from 'zod';

const BARRIERS = ['overwhelmed', 'uncertain', 'bored', 'perfectionism'];
const barrierSchema = z.enum(BARRIERS);

const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  action: z.string().min(1),
  estimateMinutes: z.number().int().min(1).max(120),
  acceptanceCriteria: z.array(z.string().min(1)).min(1),
  order: z.number().int().min(1),
});

export const atomizeTaskInputSchema = z.object({
  taskTitle: z.string().trim().min(5, 'Titulo muy corto').max(200, 'Titulo muy largo'),
  barrier: barrierSchema,
  taskId: z.string().trim().min(1).optional(),
});

export const atomizePlanSchema = z.object({
  taskTitle: z.string().min(1),
  barrier: barrierSchema,
  strategy: z.string().min(1),
  estimatedPomodoros: z.number().int().min(1).max(50),
  steps: z.array(stepSchema).min(1),
  nextBestActionId: z.string().min(1),
  antiProcrastinationTip: z.string().min(1),
});

export const completeSessionInputSchema = z.object({
  taskId: z.string().trim().min(1).nullable().optional(),
  stepId: z.string().trim().min(1).nullable().optional(),
  durationMinutes: z.number().finite().int().min(1).max(240),
  completed: z.boolean(),
});

export const generateRewardInputSchema = z.object({
  personality: z.string().trim().min(1),
  context: z.string().trim().min(1).max(300),
});

export const getUserMetricsInputSchema = z.object({
  days: z.preprocess(
    (value) => (value === undefined || value === null || value === '' ? undefined : Number(value)),
    z.number().finite().int().min(1).max(30).optional()
  ),
});
