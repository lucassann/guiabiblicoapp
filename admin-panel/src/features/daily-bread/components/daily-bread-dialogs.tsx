import { DailyBreadsActionDialog } from './daily-bread-action-dialog'
import { DailyBreadsDeleteDialog } from './daily-bread-delete-dialog'
import { useDailyBreads } from './daily-bread-provider'

export function DailyBreadsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useDailyBreads()
  return (
    <>
      <DailyBreadsActionDialog
        key='dailyBread-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <DailyBreadsActionDialog
            key={`dailyBread-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <DailyBreadsDeleteDialog
            key={`dailyBread-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
