import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function RecentSales({ users = [] }: { users?: any[] }) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro recente</p>
  }

  return (
    <div className='space-y-8'>
      {users.map((user: any, i: number) => (
        <div key={user.id || i} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarFallback>{user.email.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium text-muted-foreground'>Usuário Web</p>
              <p className='text-sm text-muted-foreground'>
                {user.email}
              </p>
            </div>
            <div className='font-medium text-emerald-600'>{user.role === 'VIP' ? 'Assinante VIP' : 'Free'}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
