import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const profileFormSchema = z.object({
  username: z
    .string('Por favor insira um nome de usuário.')
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(30, 'O nome deve ter no máximo 30 caracteres.'),
  email: z.email({
    error: (iss) =>
      iss.input === undefined
        ? 'Por favor, selecione um email.'
        : undefined,
  }),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.url('Por favor, insira uma URL válida.'),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  bio: 'Administrador do Guia Bíblico.',
  urls: [
    { value: 'https://guiabiblico.com' },
  ],
}

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Público</FormLabel>
              <FormControl>
                <Input placeholder='Nome de exibição' {...field} />
              </FormControl>
              <FormDescription>
                Este é o seu nome público de exibição. Pode ser o seu nome real ou um pseudônimo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Selecione um e-mail para exibição' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='admin@guiabiblico.com'>admin@guiabiblico.com</SelectItem>
                  <SelectItem value='contato@guiabiblico.com'>contato@guiabiblico.com</SelectItem>
                  <SelectItem value='suporte@guiabiblico.com'>suporte@guiabiblico.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Você pode gerenciar os endereços de e-mail nas suas{' '}
                <Link to='/'>configurações de e-mail</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biografia</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Conte um pouco sobre você'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Você pode usar <span>@menções</span> para interagir com outros usuários.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    URLs
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    Adicione links do seu site ou redes sociais.
                  </FormDescription>
                  <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            Adicionar URL
          </Button>
        </div>
        <Button type='submit'>Atualizar perfil</Button>
      </form>
    </Form>
  )
}
