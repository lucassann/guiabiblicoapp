import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { MaterialsDialogs } from './components/materials-dialogs'
import { MaterialsPrimaryButtons } from './components/materials-primary-buttons'
import { MaterialsProvider } from './components/materials-provider'
import { MaterialsTable } from './components/materials-table'

import { useAuthStore } from '@/stores/auth-store'

const route = getRouteApi('/_authenticated/materials/')

export function Materials() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()

  const [realMaterials, setRealMaterials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3333/api/materials', {
      headers: {
        'Authorization': `Bearer ${auth.accessToken}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha ao buscar materiais')
        return res.json()
      })
      .then(data => {
        const mappedMaterials = data.materials.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          image: m.image,
          isPremium: m.isPremium,
          price: m.price,
          link: m.link,
          category: m.category,
          createdAt: new Date(m.createdAt),
          updatedAt: new Date(m.updatedAt)
        }))
        setRealMaterials(mappedMaterials)
      })
      .catch(err => {
        console.error('Erro ao buscar materiais', err)
        setRealMaterials([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <MaterialsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Biblioteca</h2>
            <p className='text-muted-foreground'>
              Gerencie os e-books, cursos e materiais do Guia Bíblico.
            </p>
          </div>
          <MaterialsPrimaryButtons />
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8">Carregando biblioteca...</div>
        ) : (
          <MaterialsTable data={realMaterials} search={search} navigate={navigate} />
        )}
      </Main>

      <MaterialsDialogs />
    </MaterialsProvider>
  )
}
