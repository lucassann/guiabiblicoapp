'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type DailyBread } from '../data/schema'
import { useAuthStore } from '@/stores/auth-store'

type DailyBreadDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: DailyBread
}

export function DailyBreadsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: DailyBreadDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { auth } = useAuthStore()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.verseReference) return

    try {
      await fetch(`http://localhost:3333/api/daily-bread/${currentRow.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      
      onOpenChange(false)
      // Recarregar a página para o MVP (depois podemos atualizar via estado)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao deletar dailyBread', error)
      alert('Erro ao excluir dailyBread')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='daily-bread-delete-form'
      disabled={value.trim() !== currentRow.verseReference}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Excluir DailyBread
        </span>
      }
      desc={
        <form
          id='daily-bread-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Tem certeza que deseja excluir o devocional{' '}
            <span className='font-bold'>{currentRow.verseReference}</span>?
            <br />
            Esta ação removerá permanentemente este devocional do sistema. Isso não pode ser desfeito.
          </p>

          <Label className='my-2'>
            Referência:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Digite a referência para confirmar'
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Aviso!</AlertTitle>
            <AlertDescription>
              Por favor, tenha cuidado, essa operação não pode ser desfeita.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='Excluir'
      destructive
    />
  )
}
