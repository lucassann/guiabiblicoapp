import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Material } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const materialsColumns: ColumnDef<Material>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Título' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3 font-medium'>{row.getValue('title')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Descrição' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-64 text-muted-foreground'>{row.getValue('description')}</LongText>
    ),
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tópico' />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-semibold text-[11px] tracking-wider uppercase">
        {row.getValue('category') || 'GERAL'}
      </Badge>
    ),
  },
  {
    accessorKey: 'isPremium',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acesso' />
    ),
    cell: ({ row }) => {
      const isPremium = row.getValue('isPremium') as boolean
      return (
        <Badge variant={isPremium ? 'default' : 'secondary'}>
          {isPremium ? 'VIP / Pago' : 'Gratuito'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Preço' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as string
      const isPremium = row.getValue('isPremium') as boolean
      
      if (!isPremium) return <span className="text-muted-foreground">-</span>
      return <div className='w-fit text-nowrap font-medium'>{price || 'N/A'}</div>
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
