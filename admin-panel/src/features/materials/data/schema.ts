import { z } from 'zod'

const _materialSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  isPremium: z.boolean(),
  price: z.string().nullable().optional(),
  link: z.string(),
  category: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Material = z.infer<typeof _materialSchema>
