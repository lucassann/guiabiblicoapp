'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z
  .object({
    email: z.email({
      error: (iss) => (iss.input === '' ? 'O e-mail é obrigatório.' : undefined),
    }),
    password: z.string().optional(),
    role: z.string().min(1, 'A permissão é obrigatória.'),
    confirmPassword: z.string().optional(),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit) return true
      return !!data.password && data.password.length > 0
    },
    {
      message: 'A senha é obrigatória.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit) return true
      return !!password && password.length >= 8
    },
    {
      message: 'A senha deve ter pelo menos 8 caracteres.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit) return true
      return !!password && /[a-z]/.test(password)
    },
    {
      message: 'A senha deve conter pelo menos uma letra minúscula.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit) return true
      return !!password && /\d/.test(password)
    },
    {
      message: 'A senha deve conter pelo menos um número.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit) return true
      return password === confirmPassword
    },
    {
      message: 'As senhas não coincidem.',
      path: ['confirmPassword'],
    }
  )
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const { auth } = useAuthStore()
  const isEdit = !!currentRow
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          password: '',
          confirmPassword: '',
          isEdit,
        }
      : {
          email: '',
          role: '',
          password: '',
          confirmPassword: '',
          isEdit,
        },
  })

  const onSubmit = async (values: UserForm) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.accessToken}`
      }

      if (isEdit && currentRow?.id) {
        await fetch(`http://localhost:3333/api/users/${currentRow.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ 
            role: values.role,
            password: values.password ? values.password : undefined
          }),
        })
      } else {
        await fetch(`http://localhost:3333/api/users`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            email: values.email,
            password: values.password,
            role: values.role
          }),
        })
      }

      form.reset()
      onOpenChange(false)
      // Recarregar a página para o MVP
      window.location.reload()
    } catch (error) {
      console.error('Erro ao salvar usuário', error)
      alert('Erro ao salvar usuário')
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Editar Usuário' : 'Adicionar Membro'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações de acesso aqui. ' : 'Crie um novo acesso VIP aqui. '}
            Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='usuario@guiabiblico.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Permissão</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Selecione a permissão'
                      className='col-span-4'
                      items={roles.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {isEdit ? 'Nova Senha' : 'Senha'}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={isEdit ? 'Deixe em branco para manter' : 'ex: S3nhaS3gur@'}
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {isEdit ? 'Confirme a nova' : 'Confirme a senha'}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder={isEdit ? 'Repita a nova senha' : 'ex: S3nhaS3gur@'}
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                    {isEdit && (
                      <p className="col-span-4 col-start-3 text-xs text-muted-foreground mt-2">
                        Por motivos de segurança, a senha atual é criptografada e não pode ser visualizada.
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
