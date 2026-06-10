import { createFileRoute } from '@tanstack/react-router'
import { MaterialEditor } from '@/features/materials-editor'

export const Route = createFileRoute('/_authenticated/materials/$materialId/')({
  component: MaterialEditor,
})