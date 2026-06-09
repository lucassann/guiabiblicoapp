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
import { type DailyBread } from '../data/schema'
import { useAuthStore } from '@/stores/auth-store'

const formSchema = z.object({
  date: z.string().min(1, 'A data é obrigatória.'),
  verseText: z.string().min(1, 'O texto do versículo é obrigatório.'),
  verseReference: z.string().min(1, 'A referência é obrigatória.'),
  study: z.string().min(1, 'O estudo é obrigatório.'),
  imageUrl: z.string().optional(),
  isEdit: z.boolean(),
})

type DailyBreadForm = z.infer<typeof formSchema>

type DailyBreadActionDialogProps = {
  currentRow?: DailyBread
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DailyBreadsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: DailyBreadActionDialogProps) {
  const { auth } = useAuthStore()
  const isEdit = !!currentRow
  
  // Format date for input type="date"
  const defaultDate = isEdit && currentRow?.date 
    ? new Date(currentRow.date).toISOString().split('T')[0] 
    : new Date().toISOString().split('T')[0]

  const form = useForm<DailyBreadForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          date: defaultDate,
          verseText: currentRow.verseText,
          verseReference: currentRow.verseReference,
          study: currentRow.study,
          imageUrl: currentRow.imageUrl || '',
          isEdit,
        }
      : {
          date: defaultDate,
          verseText: '',
          verseReference: '',
          study: '',
          imageUrl: '',
          isEdit,
        },
  })

  const onSubmit = async (values: DailyBreadForm) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.accessToken}`
      }

      if (isEdit && currentRow?.id) {
        await fetch(`http://localhost:3333/api/daily-bread/${currentRow.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ 
            date: values.date,
            verseText: values.verseText,
            verseReference: values.verseReference,
            study: values.study,
            imageUrl: values.imageUrl
          }),
        })
      } else {
        await fetch(`http://localhost:3333/api/daily-bread`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            date: values.date,
            verseText: values.verseText,
            verseReference: values.verseReference,
            study: values.study,
            imageUrl: values.imageUrl
          }),
        })
      }

      form.reset()
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      console.error('Erro ao salvar dailyBread', error)
      alert('Erro ao salvar dailyBread')
    }
  }

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
          <DialogTitle>{isEdit ? 'Editar Pão Diário' : 'Novo Pão Diário'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações do devocional. ' : 'Crie um devocional para um dia específico. '}
            Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='dailyBread-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Data de Exibição</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
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
                name='verseReference'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Referência</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: Salmos 23:1'
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
                name='verseText'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Versículo</FormLabel>
                    <FormControl>
                      <textarea
                        className='col-span-4 flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='O Senhor é o meu pastor...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='study'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Estudo Bíblico</FormLabel>
                    <FormControl>
                      <textarea
                        className='col-span-4 flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='Escreva a reflexão ou estudo do dia...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='imageUrl'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Imagem (Opcional)</FormLabel>
                    <FormControl>
                      <div className="col-span-4 flex gap-2">
                        <Input
                          placeholder='URL ou upload...'
                          {...field}
                          className='flex-1'
                        />
                        <div className="relative flex items-center justify-center">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                          
                              const formData = new FormData()
                              formData.append('file', file)
                          
                              try {
                                const response = await fetch('http://localhost:3333/api/upload', {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${auth.accessToken}`
                                  },
                                  body: formData
                                })
                                const data = await response.json()
                                if (data.url) {
                                  field.onChange(data.url)
                                } else {
                                  alert('Erro: ' + (data.error || 'Falha ao fazer upload'))
                                }
                              } catch (err) {
                                console.error('Upload error', err)
                                alert('Erro ao fazer upload da imagem')
                              }
                            }}
                          />
                          <Button type="button" variant="secondary">Upload</Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='dailyBread-form'>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
