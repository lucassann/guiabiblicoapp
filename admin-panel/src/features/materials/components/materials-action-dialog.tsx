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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { type Material } from '../data/schema'
import { useAuthStore } from '@/stores/auth-store'
import { useNavigate } from '@tanstack/react-router'

const CATEGORIAS = [
  'GERAL',
  'LOJA',
  'PREGADORES',
  'MULHERES',
  'JOVENS',
  'CÉLULAS',
  'MAPAS',
  'ESTUDOS',
  'CRIANÇAS',
  'ANCIÕES',
]

const formSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório.'),
  description: z.string().min(1, 'A descrição é obrigatória.'),
  image: z.string().min(1, 'A imagem é obrigatória.'),
  isPremium: z.boolean(),
  price: z.string().optional(),
  link: z.string().optional(),
  category: z.string().optional(),
  isEdit: z.boolean(),
})

type MaterialForm = z.infer<typeof formSchema>

type MaterialActionDialogProps = {
  currentRow?: Material & { category?: string }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MaterialsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: MaterialActionDialogProps) {
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const isEdit = !!currentRow
  const form = useForm<MaterialForm>({
    resolver: zodResolver(formSchema),
    values: isEdit
      ? {
          title: currentRow.title,
          description: currentRow.description,
          image: currentRow.image,
          isPremium: currentRow.isPremium,
          price: currentRow.price || '',
          link: currentRow.link,
          category: currentRow.category || 'GERAL',
          isEdit,
        }
      : {
          title: '',
          description: '',
          image: '',
          isPremium: false,
          price: '',
          link: '',
          category: 'GERAL',
          isEdit,
        },
  })

  const onSubmit = async (values: MaterialForm) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.accessToken}`
      }

      if (isEdit && currentRow?.id) {
        await fetch(`http://localhost:3333/api/materials/${currentRow.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            title: values.title,
            description: values.description,
            image: values.image,
            isPremium: values.isPremium,
            price: values.price,
            link: values.link,
            category: values.category
          }),
        })
        form.reset()
        onOpenChange(false)
        window.location.reload()
      } else {
        const res = await fetch(`http://localhost:3333/api/materials`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: values.title,
            description: values.description,
            image: values.image,
            isPremium: values.isPremium,
            price: values.price,
            link: values.link,
            category: values.category
          }),
        })
        const data = await res.json()
        form.reset()
        onOpenChange(false)
        if (data.material?.id) {
          navigate({ to: `/materials/${data.material.id}` })
        } else {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Erro ao salvar material', error)
      alert('Erro ao salvar material')
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
          <DialogTitle>{isEdit ? 'Editar Material' : 'Adicionar Material'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informações do material aqui. ' : 'Crie um novo material ou conteúdo VIP aqui. '}
            Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='material-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: Esboços Avançados'
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
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: Mais de 500 esboços...'
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
                name='image'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Imagem</FormLabel>
                    <FormControl>
                      <div className="col-span-4 flex gap-2">
                        <Input
                          placeholder='https:// ou faça upload...'
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
              <FormField
                control={form.control}
                name='link'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Link externo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://... (opcional)'
                        className='col-span-4'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Tópico / Categoria</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || 'GERAL'}
                        onValueChange={(val) => {
                          field.onChange(val)
                          // Se selecionar LOJA, marca automaticamente como VIP
                          if (val === 'LOJA') {
                            form.setValue('isPremium', true)
                          }
                        }}
                      >
                        <SelectTrigger className='col-span-4'>
                          <SelectValue placeholder='Selecione um tópico' />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat === 'LOJA' ? '🛒 LOJA (VIP/Pago)' : cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isPremium'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>É Pago/VIP?</FormLabel>
                    <FormControl>
                      <div className="col-span-4 flex items-center h-10">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Preço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ex: R$ 47,90 (Opcional)'
                        className='col-span-4'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='material-form'>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
