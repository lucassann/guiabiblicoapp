import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type DailyBread } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const dailyBreadColumns: ColumnDef<DailyBread>[] = [
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
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('date')).toLocaleDateString('pt-BR')
      return <div className='w-fit text-nowrap font-medium'>{date}</div>
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'verseReference',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Referência' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 font-medium text-primary'>{row.getValue('verseReference')}</LongText>
    ),
  },
  {
    accessorKey: 'verseText',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Versículo' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-64 text-muted-foreground'>{row.getValue('verseText')}</LongText>
    ),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
