import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMaterials } from './materials-provider'

export function MaterialsPrimaryButtons() {
  const { setOpen } = useMaterials()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Adicionar</span> <Plus size={18} />
      </Button>
    </div>
  )
}
