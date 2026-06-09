import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDailyBreads } from './daily-bread-provider'

export function DailyBreadsPrimaryButtons() {
  const { setOpen } = useDailyBreads()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Adicionar</span> <Plus size={18} />
      </Button>
    </div>
  )
}
