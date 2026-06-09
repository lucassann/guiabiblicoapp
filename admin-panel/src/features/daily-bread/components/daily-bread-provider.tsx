import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type DailyBread } from '../data/schema'

type DailyBreadsDialogType = 'invite' | 'add' | 'edit' | 'delete'

type DailyBreadsContextType = {
  open: DailyBreadsDialogType | null
  setOpen: (str: DailyBreadsDialogType | null) => void
  currentRow: DailyBread | null
  setCurrentRow: React.Dispatch<React.SetStateAction<DailyBread | null>>
}

const DailyBreadsContext = React.createContext<DailyBreadsContextType | null>(null)

export function DailyBreadsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<DailyBreadsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DailyBread | null>(null)

  return (
    <DailyBreadsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </DailyBreadsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDailyBreads = () => {
  const dailyBreadContext = React.useContext(DailyBreadsContext)

  if (!dailyBreadContext) {
    throw new Error('useDailyBreads has to be used within <DailyBreadsContext>')
  }

  return dailyBreadContext
}
