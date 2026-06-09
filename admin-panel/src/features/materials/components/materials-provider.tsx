import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Material } from '../data/schema'

type MaterialsDialogType = 'invite' | 'add' | 'edit' | 'delete'

type MaterialsContextType = {
  open: MaterialsDialogType | null
  setOpen: (str: MaterialsDialogType | null) => void
  currentRow: Material | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Material | null>>
}

const MaterialsContext = React.createContext<MaterialsContextType | null>(null)

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<MaterialsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Material | null>(null)

  return (
    <MaterialsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </MaterialsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMaterials = () => {
  const materialsContext = React.useContext(MaterialsContext)

  if (!materialsContext) {
    throw new Error('useMaterials has to be used within <MaterialsContext>')
  }

  return materialsContext
}
