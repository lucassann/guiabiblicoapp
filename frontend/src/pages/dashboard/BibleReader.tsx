import { useState, useEffect } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

type Book = { id: number; name: string; abbrev: string }
type Chapter = { id: number; number: number }
type Verse = { id: number; number: number; text: string }
type Commentary = { id: number; bookAbbrev: string; chapter: number; verse: number | null; text: string }

export function BibleReader() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])
  const [commentaries, setCommentaries] = useState<Commentary[]>([])
  const [activeCommentary, setActiveCommentary] = useState<Commentary | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState('nvi')

  useEffect(() => {
    fetch('http://localhost:3333/api/bible/books')
      .then(res => res.json())
      .then(data => {
        setBooks(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book)
    setLoading(true)
    fetch(`http://localhost:3333/api/bible/books/${book.abbrev}/chapters`)
      .then(res => res.json())
      .then(data => {
        setChapters(data.chapters)
        setLoading(false)
      })
  }

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setLoading(true)
    
    Promise.all([
      fetch(`http://localhost:3333/api/bible/books/${selectedBook?.abbrev}/chapters/${chapter.number}/verses?version=${version}`).then(res => res.json()),
      fetch(`http://localhost:3333/api/bible/books/${selectedBook?.abbrev}/chapters/${chapter.number}/commentaries`).then(res => res.json())
    ]).then(([versesData, commData]) => {
      setVerses(versesData.verses)
      setCommentaries(commData.commentaries)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }

  const handleChangeVersion = (newVersion: string) => {
    setVersion(newVersion)
    if (selectedBook && selectedChapter) {
      setLoading(true)
      fetch(`http://localhost:3333/api/bible/books/${selectedBook.abbrev}/chapters/${selectedChapter.number}/verses?version=${newVersion}`)
        .then(res => res.json())
        .then(data => {
          setVerses(data.verses)
          setLoading(false)
        })
    }
  }

  const handleBackToBooks = () => {
    setSelectedBook(null)
    setSelectedChapter(null)
    setChapters([])
    setVerses([])
  }

  const handleBackToChapters = () => {
    setSelectedChapter(null)
    setVerses([])
  }

  if (loading && !books.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary-color)" />
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* View: Lista de Livros */}
      {!selectedBook && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: '#eef2ff', padding: '10px', borderRadius: '12px' }}>
                <BookOpen size={24} color="var(--primary-color)" />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Selecione um Livro</h2>
            </div>
            
            <select 
              value={version} 
              onChange={(e) => handleChangeVersion(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '14px', fontWeight: 600, outline: 'none' }}
            >
              <option value="nvi">NVI</option>
              <option value="ara">ARA</option>
              <option value="acf">ACF</option>
              <option value="arc">ARC</option>
              <option value="nvt">NVT</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            {books.map(book => (
              <div 
                key={book.id}
                onClick={() => handleSelectBook(book)}
                style={{ 
                  background: 'var(--surface-color)', padding: '16px', borderRadius: '16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '15px' }}>{book.name}</span>
                <ChevronRight size={18} color="#9ca3af" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* View: Lista de Capítulos */}
      {selectedBook && !selectedChapter && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <button 
              onClick={handleBackToBooks}
              style={{ background: 'var(--surface-color)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            >
              <ChevronLeft size={24} color="var(--text-primary)" />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{selectedBook.name}</h2>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 className="animate-spin" size={24} color="var(--primary-color)" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '12px' }}>
              {chapters.map(chapter => (
                <div 
                  key={chapter.id}
                  onClick={() => handleSelectChapter(chapter)}
                  style={{ 
                    background: 'var(--surface-color)', padding: '16px 0', borderRadius: '16px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    fontWeight: 600, fontSize: '16px'
                  }}
                >
                  {chapter.number}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* View: Leitura do Capítulo (Versículos) */}
      {selectedBook && selectedChapter && (
        <>
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px',
            position: 'sticky', top: '88px', background: 'var(--bg-color)', padding: '10px 0', zIndex: 5
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={handleBackToChapters}
                style={{ background: 'var(--surface-color)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
              >
                <ChevronLeft size={24} color="var(--text-primary)" />
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{selectedBook.name} {selectedChapter.number}</h2>
            </div>

            <select 
              value={version} 
              onChange={(e) => handleChangeVersion(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 600, outline: 'none' }}
            >
              <option value="nvi">NVI</option>
              <option value="ara">ARA</option>
              <option value="acf">ACF</option>
              <option value="arc">ARC</option>
              <option value="nvt">NVT</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 className="animate-spin" size={24} color="var(--primary-color)" />
            </div>
          ) : (
            <div style={{ 
              background: 'var(--surface-color)', padding: '24px', borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              {verses.map(verse => {
                const verseCommentary = commentaries.find(c => c.verse === verse.number)
                return (
                  <div key={verse.id} style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
                    <span style={{ color: 'var(--primary-color)', fontSize: '13px', fontWeight: 700, paddingTop: '3px', minWidth: '20px' }}>
                      {verse.number}
                    </span>
                    <p style={{ fontSize: '18px', lineHeight: 1.6, color: 'var(--text-primary)', flex: 1 }}>
                      {verse.text}
                    </p>
                    {verseCommentary && (
                      <button 
                        onClick={() => setActiveCommentary(verseCommentary)}
                        style={{ 
                          background: '#fef3c7', border: 'none', color: '#d97706', padding: '4px 8px', borderRadius: '8px',
                          cursor: 'pointer', fontSize: '12px', fontWeight: 700, height: 'fit-content', marginTop: '4px'
                        }}
                      >
                        Nota
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Modal do Comentário */}
      {activeCommentary && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-end'
        }} onClick={() => setActiveCommentary(null)}>
          <div style={{
            background: 'var(--surface-color)', width: '100%', maxWidth: '600px',
            borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', animation: 'slideUp 0.3s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                Comentário - Versículo {activeCommentary.verse}
              </h3>
              <button 
                onClick={() => setActiveCommentary(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9ca3af' }}
              >
                &times;
              </button>
            </div>
            <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              {activeCommentary.text}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
