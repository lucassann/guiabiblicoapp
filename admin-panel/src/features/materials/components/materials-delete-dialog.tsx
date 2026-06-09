'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Material } from '../data/schema'
import { useAuthStore } from '@/stores/auth-store'

type MaterialDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Material
}

export function MaterialsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: MaterialDeleteDialogProps) {
  const [value, setValue] = useState('')
  const { auth } = useAuthStore()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.title) return

    try {
      await fetch(`http://localhost:3333/api/materials/${currentRow.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      })
      
      onOpenChange(false)
      // Recarregar a página para o MVP (depois podemos atualizar via estado)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao deletar material', error)
      alert('Erro ao excluir material')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='materials-delete-form'
      disabled={value.trim() !== currentRow.title}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Excluir Material
        </span>
      }
      desc={
        <form
          id='materials-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            Tem certeza que deseja excluir o material{' '}
            <span className='font-bold'>{currentRow.title}</span>?
            <br />
            Esta ação removerá permanentemente este material do sistema. Isso não pode ser desfeito.
          </p>

          <Label className='my-2'>
            Título:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Digite o título para confirmar'
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
