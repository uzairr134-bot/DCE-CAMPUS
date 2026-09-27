import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(['student', 'admin']),
  accessCode: z.string().trim().optional(),
  adminCategory: z.enum(['Electrical', 'Plumbing', 'Furniture', 'Cleanliness', 'Internet/Wi-Fi', 'Safety', 'Other']).optional()
})

export const adminCategorySchema = z.object({
  adminCategory: signupSchema.shape.adminCategory.unwrap()
})

export const loginSchema = signupSchema.extend({
  accessCode: z.string().trim().optional()
})

export const issueSchema = z.object({
  title: z.string().trim().min(1).max(160),
  category: z.string().trim().min(1).max(80),
  location: z.string().trim().min(1).max(160),
  priority: z.enum(['Low', 'Medium', 'High']),
  description: z.string().trim().min(1).max(5000),
  notifyBuzzer: z.boolean().default(false),
  photoUrl: z.string().trim().url().optional()
})

export const statusSchema = z.object({
  status: z.enum(['Reported', 'Assigned', 'Resolved'])
})

export const helplineSchema = z.object({
  helpline: z.string().trim().min(3).max(30)
})

export const donationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  amount: z.coerce.number().positive().finite(),
  message: z.string().trim().max(1000).optional()
})

export const idSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id.')

export function parseBody(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => issue.message).join(' '))
    error.statusCode = 400
    throw error
  }
  return result.data
}