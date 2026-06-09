import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { users as fakeUsers } from './data/users'

import { useAuthStore } from '@/stores/auth-store'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()

  const [realUsers, setRealUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3333/api/users', {
      headers: {
        'Authorization': `Bearer ${auth.accessToken}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha na autenticação')
        return res.json()
      })
      .then(data => {
        const mappedUsers = data.users.map((u: any) => ({
          id: u.id,
          firstName: 'Membro',
          lastName: 'Premium',
          username: u.email.split('@')[0],
          email: u.email,
          phoneNumber: '-',
          status: 'active',
          role: u.role || 'user',
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt)
        }))
        setRealUsers(mappedUsers)
      })
      .catch(err => {
        console.error('Erro ao buscar usuários', err)
        setRealUsers([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Membros</h2>
            <p className='text-muted-foreground'>
              Gerencie os assinantes e usuários do Guia Bíblico.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8">Carregando membros...</div>
        ) : (
          <UsersTable data={realUsers} search={search} navigate={navigate} />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
