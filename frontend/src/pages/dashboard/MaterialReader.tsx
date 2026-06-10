import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Bookmark, BookmarkCheck, ZoomIn, ZoomOut, ChevronLeft, Loader2 } from 'lucide-react'

interface Section {
  id: string
  title: string
  content: string
  parentId: string | null
  sortOrder: number
  children: Section[]
}

interface MaterialData {
  id: string
  title: string
  description: string
  image: string
  sections: Section[]
}

export function MaterialReader({ materialId, onBack }: { materialId: string; onBack: () => void }) {
  const [material, setMaterial] = useState<MaterialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [bookmark, setBookmark] = useState<any>(null)
  const [fontSize, setFontSize] = useState(16)

  const token = localStorage.getItem('token')
  const fontSizeMin = 12
  const fontSizeMax = 32

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      fetch(`http://localhost:3333/api/materials/${materialId}/content`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      fetch(`http://localhost:3333/api/materials/${materialId}/bookmark`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json())
    ]).then(([contentData, bookmarkData]) => {
      if (contentData?.material) {
        setMaterial(contentData.material)
        const allIds = new Set<string>()
        const collectIds = (sections: Section[]) => {
          sections.forEach(s => {
            allIds.add(s.id)
            s.children.forEach(c => allIds.add(c.id))
          })
        }
        collectIds(contentData.material.sections)
        setExpandedSections(allIds)
      }
      if (bookmarkData?.bookmark) {
        setBookmark(bookmarkData.bookmark)
      }
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [materialId])

  useEffect(() => {
    if (bookmark?.sectionId && material) {
      setTimeout(() => {
        const el = document.getElementById(`section-${bookmark.sectionId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 500)
    }
  }, [bookmark, material])

  const handleSaveBookmark = async (sectionId?: string) => {
    if (!token) return
    try {
      const res = await fetch(`http://localhost:3333/api/materials/${materialId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sectionId: sectionId || null, progress: sectionId ? 1 : 0 })
      })
      const data = await res.json()
      if (data.bookmark) setBookmark(data.bookmark)
    } catch (err) {
      console.error('Erro ao salvar bookmark', err)
    }
  }

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
      </div>
    )
  }

  if (!material) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        Material não encontrado
      </div>
    )
  }

  const renderSection = (section: Section, depth: number = 0) => {
    const isExpanded = expandedSections.has(section.id)
    const isBookmarked = bookmark?.sectionId === section.id
    const hasChildren = section.children && section.children.length > 0

    return (
      <div key={section.id} id={`section-${section.id}`} style={{
        marginBottom: '16px',
        marginLeft: `${depth * 16}px`,
        scrollMarginTop: '100px'
      }}>
        <div
          onClick={() => hasChildren && toggleSection(section.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: isBookmarked ? '#fef3c7' : 'var(--surface-color)',
            borderRadius: '12px',
            cursor: hasChildren ? 'pointer' : 'default',
            border: isBookmarked ? '2px solid #f59e0b' : '1px solid var(--border-color)',
            transition: 'all 0.2s'
          }}
        >
          {hasChildren && (
            <span style={{ color: 'var(--text-secondary)', display: 'flex' }}>
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
          )}
          <span style={{ fontWeight: depth === 0 ? 700 : 600, fontSize: depth === 0 ? '16px' : '15px', flex: 1, color: 'var(--text-primary)' }}>
            {section.title}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleSaveBookmark(section.id) }}
            title="Marcar/Desmarcar posição"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: isBookmarked ? '#f59e0b' : 'var(--text-secondary)',
              padding: '4px'
            }}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>

        <div style={{ overflow: 'hidden', maxHeight: isExpanded ? '20000px' : '0px' }}>
          <div style={{
            padding: '16px 20px',
            fontSize: `${fontSize}px`,
            lineHeight: 1.7,
            color: 'var(--text-primary)'
          }}>
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>

          {hasChildren && section.children.map(child => renderSection(child, depth + 1))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '24px', position: 'sticky', top: '76px',
        background: 'var(--bg-color)', padding: '12px 0', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{
            background: 'var(--surface-color)', border: 'none', padding: '8px',
            borderRadius: '50%', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <ChevronLeft size={24} color="var(--text-primary)" />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {material.title}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setFontSize(f => Math.max(fontSizeMin, f - 2))}
            disabled={fontSize <= fontSizeMin}
            style={{
              background: 'var(--surface-color)', border: '1px solid var(--border-color)',
              borderRadius: '8px', padding: '8px 10px', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px',
              opacity: fontSize <= fontSizeMin ? 0.4 : 1
            }}
            title="Diminuir fonte"
          >
            <ZoomOut size={16} /> <span style={{ fontSize: '13px' }}>A-</span>
          </button>
          <span style={{
            fontSize: '13px', color: 'var(--text-secondary)',
            minWidth: '40px', textAlign: 'center', fontWeight: 600
          }}>
            {fontSize}px
          </span>
          <button
            onClick={() => setFontSize(f => Math.min(fontSizeMax, f + 2))}
            disabled={fontSize >= fontSizeMax}
            style={{
              background: 'var(--surface-color)', border: '1px solid var(--border-color)',
              borderRadius: '8px', padding: '8px 10px', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px',
              opacity: fontSize >= fontSizeMax ? 0.4 : 1
            }}
            title="Aumentar fonte"
          >
            <ZoomIn size={16} /> <span style={{ fontSize: '13px' }}>A+</span>
          </button>
          <button
            onClick={() => handleSaveBookmark(bookmark?.sectionId || undefined)}
            style={{
              background: bookmark ? '#fef3c7' : 'var(--surface-color)',
              border: `1px solid ${bookmark ? '#f59e0b' : 'var(--border-color)'}`,
              borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
              color: bookmark ? '#d97706' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
            title={bookmark ? 'Bookmark salvo' : 'Marcar progresso'}
          >
            {bookmark ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {bookmark ? 'Salvo' : 'Marcar'}
            </span>
          </button>
        </div>
      </div>

      {material.sections.length === 0 ? (
        <div style={{
          background: 'var(--surface-color)', padding: '40px', borderRadius: '24px',
          textAlign: 'center', color: 'var(--text-secondary)'
        }}>
          Este material ainda não possui conteúdo
        </div>
      ) : (
        <div>
          {material.sections.map(section => renderSection(section))}
        </div>
      )}
    </div>
  )
}