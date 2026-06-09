import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { DailyBreads } from '@/features/daily-bread'

const dailyBreadSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  verseReference: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/daily-bread/')({
  validateSearch: dailyBreadSearchSchema,
  component: DailyBreads,
})
