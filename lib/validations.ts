import { z } from 'zod';

// Base validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .max(100, 'Password must be less than 100 characters');

export const displayNameSchema = z
  .string()
  .max(50, 'Display name must be less than 50 characters')
  .optional();

// Auth validation schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  displayName: displayNameSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Idea validation schemas
export const ideaSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform(val => val?.trim() || undefined),
  tags: z
    .array(z.string())
    .default([]),
  impact: z
    .number()
    .min(1, 'Impact must be at least 1')
    .max(5, 'Impact must be at most 5')
    .default(3),
  effort: z
    .number()
    .min(1, 'Effort must be at least 1')
    .max(5, 'Effort must be at most 5')
    .default(3),
});

export const ideaUpdateSchema = ideaSchema.partial();

// Task validation schemas
export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .transform(val => val?.trim() || undefined),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  dueDate: z
    .date()
    .optional(),
  estimatedHours: z
    .number()
    .min(0.1, 'Estimated hours must be at least 0.1')
    .max(1000, 'Estimated hours must be less than 1000')
    .optional(),
  tags: z
    .array(z.string())
    .default([]),
  subtasks: z
    .array(z.string().min(1, 'Subtask title cannot be empty'))
    .default([]),
});

export const taskUpdateSchema = taskSchema.partial();

export const subtaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Subtask title is required')
    .max(200, 'Subtask title must be less than 200 characters')
    .trim(),
});

// Tag validation schemas
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name is required')
    .max(30, 'Tag name must be less than 30 characters')
    .trim()
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'),
});

// Search and filter validation schemas
export const searchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
  tags: z
    .array(z.string())
    .optional(),
  quadrants: z
    .array(z.enum(['q1', 'q2', 'q3', 'q4']))
    .optional(),
  sortBy: z
    .enum(['date', 'title', 'impact', 'effort'])
    .default('date'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
});

// Bulk operations validation schemas
export const bulkUpdateSchema = z.object({
  ids: z
    .array(z.string().uuid('Invalid ID format'))
    .min(1, 'At least one item must be selected'),
  updates: ideaUpdateSchema,
});

export const bulkDeleteSchema = z.object({
  ids: z
    .array(z.string().uuid('Invalid ID format'))
    .min(1, 'At least one item must be selected'),
});

// Type exports
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type IdeaFormData = z.infer<typeof ideaSchema>;
export type IdeaUpdateData = z.infer<typeof ideaUpdateSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type TaskUpdateData = z.infer<typeof taskUpdateSchema>;
export type SubtaskFormData = z.infer<typeof subtaskSchema>;
export type TagFormData = z.infer<typeof tagSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type BulkUpdateData = z.infer<typeof bulkUpdateSchema>;
export type BulkDeleteData = z.infer<typeof bulkDeleteSchema>;

// Validation helper functions
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

export function getFieldError(errors: z.ZodError, fieldName: string): string | undefined {
  const fieldError = errors.errors.find(error => 
    error.path.length > 0 && error.path[0] === fieldName
  );
  return fieldError?.message;
}