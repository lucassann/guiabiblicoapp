import { z } from 'zod'

const _dailyBreadSchema = z.object({
  id: z.string(),
  date: z.string(),
  verseText: z.string(),
  verseReference: z.string(),
  study: z.string(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type DailyBread = z.infer<typeof _dailyBreadSchema>
