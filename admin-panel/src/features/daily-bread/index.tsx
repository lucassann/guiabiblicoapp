import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { DailyBreadsDialogs } from './components/daily-bread-dialogs'
import { DailyBreadsPrimaryButtons } from './components/daily-bread-primary-buttons'
import { DailyBreadsProvider } from './components/daily-bread-provider'
import { DailyBreadsTable } from './components/daily-bread-table'

import { useAuthStore } from '@/stores/auth-store'

const route = getRouteApi('/_authenticated/daily-bread/')

export function DailyBreads() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()

  const [realDailyBreads, setRealDailyBreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3333/api/daily-bread', {
      headers: {
        'Authorization': `Bearer ${auth.accessToken}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao buscar devocionais')
        return res.json()
      })
      .then(data => {
        const mappedDailyBreads = data.dailyBreads.map((m: any) => ({
          id: m.id,
          date: m.date,
          verseText: m.verseText,
          verseReference: m.verseReference,
          study: m.study,
          imageUrl: m.imageUrl,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt)
        }))
        setRealDailyBreads(mappedDailyBreads)
      })
      .catch(err => {
        console.error('Erro ao buscar devocionais', err)
        setRealDailyBreads([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <DailyBreadsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Pão Diário</h2>
            <p className='text-muted-foreground'>
              Gerencie os devocionais, versículos e estudos bíblicos diários.
            </p>
          </div>
          <DailyBreadsPrimaryButtons />
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8">Carregando biblioteca...</div>
        ) : (
          <DailyBreadsTable data={realDailyBreads} search={search} navigate={navigate} />
        )}
      </Main>

      <DailyBreadsDialogs />
    </DailyBreadsProvider>
  )
}
