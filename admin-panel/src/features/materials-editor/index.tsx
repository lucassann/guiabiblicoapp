import { useEffect, useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/materials/$materialId/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { useAuthStore } from '@/stores/auth-store'
import { ChevronDown, ChevronRight, Plus, Trash2, ArrowUp, ArrowDown, FileText, Save, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TiptapEditor } from './tiptap-editor'

interface Section {
  id?: string
  title: string
  content: string
  parentId: string | null
  sortOrder: number
  children: Section[]
  _isNew?: boolean
}

export function MaterialEditor() {
  const { materialId } = Route.useParams()
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const [material, setMaterial] = useState<any>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`http://localhost:3333/api/materials/${materialId}/content`, {
      headers: { 'Authorization': `Bearer ${auth.accessToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.material) {
          setMaterial(data.material)
          const sections = data.material.sections || []
          setSections(sections)
          const allIds = new Set<string>()
          const collect = (list: Section[]) => {
            list.forEach(s => {
              allIds.add(s.id || s.title)
              collect(s.children)
            })
          }
          collect(sections)
          setExpandedSections(allIds)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
        toast.error('Erro ao carregar material')
      })
  }, [materialId])

  const addSection = () => {
    const newSection: Section = {
      title: 'Nova Seção',
      content: '<p></p>',
      parentId: null,
      sortOrder: sections.length,
      children: [],
      _isNew: true
    }
    setSections([...sections, newSection])
    setExpandedSections(new Set(expandedSections).add('new' + Date.now()))
  }

  const addSubSection = (parentIndex: number) => {
    const updated = [...sections]
    const parent = updated[parentIndex]
    const newSub: Section = {
      title: 'Nova Subseção',
      content: '<p></p>',
      parentId: parent.id || null,
      sortOrder: parent.children.length,
      children: [],
      _isNew: true
    }
    parent.children.push(newSub)
    setSections(updated)
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  const removeSubSection = (parentIndex: number, childIndex: number) => {
    const updated = [...sections]
    updated[parentIndex].children = updated[parentIndex].children.filter((_, i) => i !== childIndex)
    setSections(updated)
  }

  const updateSection = (index: number, field: string, value: string) => {
    const updated = [...sections]
    ;(updated[index] as any)[field] = value
    setSections(updated)
  }

  const updateSubSection = (parentIndex: number, childIndex: number, field: string, value: string) => {
    const updated = [...sections]
    ;(updated[parentIndex].children[childIndex] as any)[field] = value
    setSections(updated)
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return
    const updated = [...sections]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    updated[index].sortOrder = index
    updated[newIndex].sortOrder = newIndex
    setSections(updated)
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.accessToken}`
      }

      for (const section of sections) {
        if (section._isNew || !section.id) {
          const res = await fetch(`http://localhost:3333/api/materials/${materialId}/sections`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              title: section.title,
              content: section.content,
              sortOrder: section.sortOrder
            })
          })
          const data = await res.json()
          if (data.section) {
            section.id = data.section.id
            section._isNew = false
          }
        } else {
          await fetch(`http://localhost:3333/api/materials/sections/${section.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              title: section.title,
              content: section.content,
              sortOrder: section.sortOrder
            })
          })
        }

        if (section.children) {
          for (const child of section.children) {
            if (child._isNew || !child.id) {
              await fetch(`http://localhost:3333/api/materials/${materialId}/sections`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  title: child.title,
                  content: child.content,
                  parentId: section.id,
                  sortOrder: child.sortOrder
                })
              })
            } else {
              await fetch(`http://localhost:3333/api/materials/sections/${child.id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                  title: child.title,
                  content: child.content,
                  sortOrder: child.sortOrder
                })
              })
            }
          }
        }
      }

      toast.success('Conteúdo salvo com sucesso!')
      window.location.reload()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar conteúdo')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {material?.title || 'Editor de Conteúdo'}
            </h2>
            <p className='text-muted-foreground'>
              Editor visual - formate como um blog.
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant="outline" onClick={() => navigate({ to: '/materials' })}>
              <Eye size={16} className="me-1" /> Voltar
            </Button>
            <Button onClick={saveAll} disabled={saving}>
              {saving ? <Loader2 className="animate-spin me-1" size={16} /> : <Save size={16} className="me-1" />}
              {saving ? 'Salvando...' : 'Salvar Tudo'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button onClick={addSection} variant="default">
            <Plus size={16} className="me-1" /> Adicionar Seção
          </Button>
        </div>

        {sections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText size={48} className="mx-auto mb-4 opacity-30" />
              <p>Nenhuma seção ainda. Clique em "Adicionar Seção" para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const key = section.id || `s${index}`
                          const next = new Set(expandedSections)
                          if (next.has(key)) next.delete(key)
                          else next.add(key)
                          setExpandedSections(next)
                        }}
                      >
                        {expandedSections.has(section.id || `s${index}`) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </Button>
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        className="text-lg font-semibold border-0 bg-transparent focus-visible:ring-0 focus-visible:bg-muted px-2 h-10"
                        placeholder="Título da seção"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => moveSection(index, 'up')} disabled={index === 0}>
                        <ArrowUp size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1}>
                        <ArrowDown size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => addSubSection(index)}>
                        <Plus size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeSection(index)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedSections.has(section.id || `s${index}`) && (
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Conteúdo</label>
                      <TiptapEditor
                        value={section.content}
                        onChange={(val) => updateSection(index, 'content', val)}
                      />
                    </div>

                    {section.children.length > 0 && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <p className="text-sm font-medium text-muted-foreground">Subseções:</p>
                        {section.children.map((child, childIndex) => (
                          <Card key={childIndex} className="border-l-4 border-l-amber-400">
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between gap-2">
                                <Input
                                  value={child.title}
                                  onChange={(e) => updateSubSection(index, childIndex, 'title', e.target.value)}
                                  className="font-medium border-0 bg-transparent focus-visible:ring-0 focus-visible:bg-muted px-2 h-9"
                                  placeholder="Título da subseção"
                                />
                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 shrink-0" onClick={() => removeSubSection(index, childIndex)}>
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <TiptapEditor
                                value={child.content}
                                onChange={(val) => updateSubSection(index, childIndex, 'content', val)}
                              />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </Main>
    </>
  )
}