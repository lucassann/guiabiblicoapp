import { MaterialsActionDialog } from './materials-action-dialog'
import { MaterialsDeleteDialog } from './materials-delete-dialog'
import { useMaterials } from './materials-provider'

export function MaterialsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useMaterials()
  return (
    <>
      <MaterialsActionDialog
        key='material-add'
        open={open === 'add'}
        onOpenChange={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <MaterialsActionDialog
            key={`material-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <MaterialsDeleteDialog
            key={`material-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen(null)
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
