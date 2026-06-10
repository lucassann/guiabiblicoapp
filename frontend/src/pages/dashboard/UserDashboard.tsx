import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Search, Bell, BookOpen, MessageCircle, PlayCircle, Lock, Home, User, Flame, Trophy, Calendar, Share2, Download, Copy, Image as ImageIcon, Type, Award, RefreshCw, Bookmark } from 'lucide-react'
import { toPng } from 'html-to-image'
import { BibleReader } from './BibleReader'
import { MaterialReader } from './MaterialReader'
import { PasswordChangeModal, NotificationsModal } from './ProfileModals'

export function UserDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [user, setUser] = useState<any>(null)

  const [materials, setMaterials] = useState<any[]>([])
  const [dailyBread, setDailyBread] = useState<any>(null)
  const [showStudyModal, setShowStudyModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [readingMaterial, setReadingMaterial] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)

  // Real user data with progress
  const [userProfile, setUserProfile] = useState<any>(null)
  
  // Share Studio States
  const [showShareStudio, setShowShareStudio] = useState(false)
  const [shareTab, setShareTab] = useState<'image' | 'text'>('image')
  const [shareFormat, setShareFormat] = useState<'square' | 'story'>('square')
  const [shareBgColor, setShareBgColor] = useState('linear-gradient(135deg, #111827 0%, #374151 100%)')
  const [shareTextColor, setShareTextColor] = useState('#ffffff')
  const imagePreviewRef = useRef<HTMLDivElement>(null)

  const bgColors = [
    'linear-gradient(135deg, #111827 0%, #374151 100%)', // Dark Gray
    'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // Blue
    'linear-gradient(135deg, #064e3b 0%, #10b981 100%)', // Green
    'linear-gradient(135deg, #701a75 0%, #d946ef 100%)', // Purple
    'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)', // Red
    '#f8fafc', // Light Gray (Needs dark text)
    '#fef3c7', // Light Yellow (Needs dark text)
  ]

  const [refreshing, setRefreshing] = useState(false)

  const fetchMaterials = useCallback((token: string) => {
    return fetch('http://localhost:3333/api/materials', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.materials) setMaterials(data.materials)
      })
      .catch(err => console.error('Erro ao buscar materiais', err))
  }, [])

  const handleRefreshMaterials = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    setRefreshing(true)
    await fetchMaterials(token)
    setRefreshing(false)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser) {
      navigate('/login', { replace: true })
      return
    }

    setUser(JSON.parse(storedUser))

    // Buscar os materiais na montagem
    fetchMaterials(token)

    // Polling: atualiza materiais automaticamente a cada 30 segundos
    const interval = setInterval(() => fetchMaterials(token), 30000)

    // Buscar o Pão Diário de hoje
    fetch('http://localhost:3333/api/daily-bread/today', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.dailyBread) setDailyBread(data.dailyBread)
      })
      .catch(err => console.error('Erro ao buscar pão diário', err))

    // Buscar Perfil do Usuário
    fetch('http://localhost:3333/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) setUserProfile(data.user)
      })
      .catch(err => console.error('Erro ao buscar perfil do usuário', err))

    return () => clearInterval(interval)
  }, [navigate, fetchMaterials])

  const predefinedAvatars = [
    'https://api.dicebear.com/7.x/notionists/svg?seed=Felix',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Jack',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Coco',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Lilly',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Mia',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Sam',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Chloe',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Bandit',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Abby'
  ]

  const handleUpdateAvatar = (avatarUrl: string) => {
    const token = localStorage.getItem('token')
    fetch('http://localhost:3333/api/users/avatar', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ avatarId: avatarUrl })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setUserProfile(data.user)
          setShowAvatarModal(false)
        }
      })
      .catch(() => alert('Erro ao atualizar avatar'))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const handleDownloadImage = async () => {
    if (!imagePreviewRef.current) return
    try {
      // Ensure the element is rendered properly before capturing
      const dataUrl = await toPng(imagePreviewRef.current, { quality: 1, pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `Pão-Diário-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Erro ao gerar imagem:', err)
      alert('Não foi possível gerar a imagem.')
    }
  }

  const handleShareImage = async () => {
    if (!imagePreviewRef.current) return
    try {
      const dataUrl = await toPng(imagePreviewRef.current, { quality: 1, pixelRatio: 2 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `Pão-Diário.png`, { type: 'image/png' })
      
      if (navigator.share) {
        await navigator.share({
          title: 'Pão Diário',
          text: 'Olha que versículo lindo que tirei no Guia Bíblico!',
          files: [file]
        })
      } else {
        alert('Seu navegador não suporta compartilhamento direto de arquivos. A imagem será baixada.')
        handleDownloadImage()
      }
    } catch (err) {
      console.error('Erro ao compartilhar imagem:', err)
    }
  }

  const handleCopyText = () => {
    const text = `*Pão Diário - ${dailyBread?.verseReference}*\n\n_"${dailyBread?.verseText}"_\n\n${dailyBread?.study?.replace(/### /g, '')}\n\nLeia mais no app Guia Bíblico!`;
    navigator.clipboard.writeText(text)
    alert('Texto copiado para a área de transferência!')
  }

  if (!user) return null // ou um loading spinner

  const displayName = user.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ')

  const verseLength = dailyBread?.verseText?.length || 0;
  let verseFontSizeSq = '24px';
  let verseFontSizeSt = '18px'; // Adjusted from 20px
  let marginSpacingSq = '24px';
  let marginSpacingSt = '16px';
  
  if (verseLength > 150) {
    verseFontSizeSq = '16px';
    verseFontSizeSt = '12px'; // Adjusted from 13px
    marginSpacingSt = '8px'; // Adjusted from 12px
  } else if (verseLength > 90) {
    verseFontSizeSq = '20px';
    verseFontSizeSt = '14px'; // Adjusted from 15px
    marginSpacingSt = '12px';
  }
  
  const currentVerseFontSize = shareFormat === 'square' ? verseFontSizeSq : verseFontSizeSt;
  const currentMarginSpacing = shareFormat === 'square' ? marginSpacingSq : marginSpacingSt;

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Top Header */}
      <header style={{ 
        background: 'var(--surface-color)', 
        padding: '20px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setShowAvatarModal(true)}
              style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: 'none', cursor: 'pointer', padding: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src={userProfile?.avatarId || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}`} alt="User Avatar" style={{ width: '100%' }} />
            </button>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '2px' }}>Bem-vindo de volta,</p>
              <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</h1>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ background: 'var(--bg-color)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative' }}>
              <Bell size={20} />
              {/* Notification Badge */}
              <div style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%' }}></div>
            </button>
            
            {showNotifications && (
              <div style={{
                position: 'absolute', top: '50px', right: '0', width: '300px', background: 'var(--surface-color)',
                borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600 }}>Notificações</h4>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-color)', marginTop: '6px' }}></div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Bem-vindo ao Guia Bíblico!</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Explore sua biblioteca, estude o Pão Diário e acompanhe o seu progresso diário.</p>
                      <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', display: 'block' }}>Hoje</span>
                    </div>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', gap: '12px', opacity: 0.7 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'transparent', border: '1px solid var(--border-color)', marginTop: '6px' }}></div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Novo Pão Diário</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>Você já leu a reflexão bíblica de hoje? Não perca seu progresso.</p>
                      <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px', display: 'block' }}>Ontem</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
        {readingMaterial ? null : activeTab === 'home' && (
          <>
            {/* Search Bar */}
        <div style={{ 
          background: 'var(--surface-color)', padding: '16px 20px', borderRadius: 'var(--border-radius)',
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
        }}>
          <Search size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Buscar materiais..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', width: '100%', fontSize: '16px', outline: 'none' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '18px' }}>&times;</button>
          )}
        </div>

        {/* Daily Bread (Pão Diário) */}
        {dailyBread && (
          <div style={{ 
            background: dailyBread.imageUrl ? `linear-gradient(rgba(17,24,39,0.85), rgba(17,24,39,0.95)), url(${dailyBread.imageUrl}) center/cover` : 'linear-gradient(135deg, #111827 0%, #374151 100%)', 
            borderRadius: 'var(--border-radius)', padding: '24px', color: '#fff',
            marginBottom: '32px', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Calendar size={18} color="#9ca3af" />
              <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>Pão Diário - Hoje</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.4, marginBottom: '16px', color: '#fff' }}>
              "{dailyBread.verseText}"
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>{dailyBread.verseReference}</p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowStudyModal(true)}
                style={{
                  background: 'var(--primary-color)', color: '#fff', border: 'none',
                  padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                }}>
                <BookOpen size={16} />
                Ler Estudo
              </button>
              
              <button 
                onClick={() => setShowShareStudio(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                  padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <Share2 size={16} />
                Compartilhar
              </button>
            </div>
          </div>
        )}

        {/* Modal de Estudo Bíblico */}
        {showStudyModal && dailyBread && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'var(--bg-color)', width: '100%', maxWidth: '600px',
              borderRadius: '24px', padding: '32px', position: 'relative',
              maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              <button 
                onClick={() => setShowStudyModal(false)}
                style={{
                  position: 'absolute', top: '24px', right: '24px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <BookOpen size={20} color="var(--primary-color)" />
                <span style={{ color: 'var(--primary-color)', fontSize: '14px', fontWeight: 600 }}>Estudo Bíblico do Dia</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {dailyBread.verseReference}
              </h2>
              <p style={{ fontSize: '18px', fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '32px', paddingLeft: '16px', borderLeft: '4px solid var(--primary-color)' }}>
                "{dailyBread.verseText}"
              </p>
              
              <div style={{ color: 'var(--text-primary)', fontSize: '16px', lineHeight: 1.6 }}>
                {dailyBread.study.split('\n').map((line: string, index: number) => {
                  if (line.trim() === '') return null;
                  
                  if (line.startsWith('### ')) {
                    return (
                      <h3 key={index} style={{ fontSize: '18px', fontWeight: 700, marginTop: '24px', marginBottom: '8px', color: 'var(--primary-color)' }}>
                        {line.replace('### ', '')}
                      </h3>
                    );
                  }
                  
                  return (
                    <p key={index} style={{ marginBottom: '12px' }}>
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modal do Estúdio de Compartilhamento */}
        {showShareStudio && dailyBread && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', backdropFilter: 'blur(5px)'
          }}>
            <div style={{
              background: 'var(--bg-color)', width: '100%', maxWidth: '800px',
              borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
            }}>
              {/* Header do Estúdio */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Share2 size={20} color="var(--primary-color)" /> Estúdio de Compartilhamento
                </h3>
                <button onClick={() => setShowShareStudio(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Corpo do Estúdio */}
              <div className="share-studio-container">
                
                {/* Lateral Esquerda - Controles */}
                <div className="share-studio-sidebar">
                  
                  {/* Tabs: Imagem ou Texto */}
                  <div style={{ display: 'flex', background: 'var(--bg-color)', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
                    <button 
                      onClick={() => setShareTab('image')}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: shareTab === 'image' ? 'var(--primary-color)' : 'transparent', color: shareTab === 'image' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                      <ImageIcon size={16} /> Imagem
                    </button>
                    <button 
                      onClick={() => setShareTab('text')}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: shareTab === 'text' ? 'var(--primary-color)' : 'transparent', color: shareTab === 'text' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                      <Type size={16} /> Texto
                    </button>
                  </div>

                  {shareTab === 'image' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Formato */}
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Formato</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setShareFormat('square')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${shareFormat === 'square' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Feed (1:1)</button>
                          <button onClick={() => setShareFormat('story')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${shareFormat === 'story' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Stories (9:16)</button>
                        </div>
                      </div>

                      {/* Cor de Fundo */}
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Cor de Fundo</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                          {bgColors.map((color, idx) => (
                            <button key={idx} onClick={() => setShareBgColor(color)} style={{ width: '100%', aspectRatio: '1', borderRadius: '8px', background: color, border: shareBgColor === color ? '2px solid var(--primary-color)' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
                          ))}
                        </div>
                      </div>

                      {/* Cor da Letra */}
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Cor da Letra</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setShareTextColor('#ffffff')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${shareTextColor === '#ffffff' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: '#333', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Clara</button>
                          <button onClick={() => setShareTextColor('#111827')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${shareTextColor === '#111827' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: '#f8fafc', color: '#111827', cursor: 'pointer', fontWeight: 600 }}>Escura</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {shareTab === 'text' && (
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>O estudo completo será copiado em formato de texto para você colar no WhatsApp, Telegram ou onde desejar.</p>
                    </div>
                  )}
                </div>

                {/* Área Direita - Preview e Ações */}
                <div className="share-studio-preview">
                  
                  {shareTab === 'image' && (
                    <>
                      {/* O Container que será transformado em Imagem */}
                      <div style={{ width: '100%', maxWidth: '350px', display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <div 
                          ref={imagePreviewRef}
                          style={{
                            width: shareFormat === 'square' ? '100%' : '250px',
                            aspectRatio: shareFormat === 'square' ? '1/1' : '9/16',
                            background: shareBgColor,
                            color: shareTextColor,
                            padding: shareFormat === 'square' ? '32px' : '24px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                            textAlign: 'center', borderRadius: '0px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                          }}
                        >
                          <Calendar size={24} color={shareTextColor} style={{ opacity: 0.7, marginBottom: currentMarginSpacing, flexShrink: 0 }} />
                          <h2 style={{ fontSize: currentVerseFontSize, fontWeight: 700, fontStyle: 'italic', lineHeight: 1.4, marginBottom: currentMarginSpacing, wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 15, WebkitBoxOrient: 'vertical' }}>
                            "{dailyBread.verseText}"
                          </h2>
                          <p style={{ fontSize: '14px', fontWeight: 500, opacity: 0.9, flexShrink: 0 }}>{dailyBread.verseReference}</p>
                          <div style={{ marginTop: 'auto', paddingTop: currentMarginSpacing, opacity: 0.6, fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>
                            app.guiabiblico.com
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '350px' }}>
                        <button onClick={handleDownloadImage} style={{ flex: 1, background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <Download size={18} /> Baixar
                        </button>
                        <button onClick={handleShareImage} style={{ flex: 1, background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <Share2 size={18} /> Compartilhar
                        </button>
                      </div>
                    </>
                  )}

                  {shareTab === 'text' && (
                    <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <textarea 
                        readOnly
                        value={`*Pão Diário - ${dailyBread.verseReference}*\n\n_"${dailyBread.verseText}"_\n\n${dailyBread.study.replace(/### /g, '')}\n\nLeia mais no app Guia Bíblico!`}
                        style={{ width: '100%', height: '300px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.5, resize: 'none' }}
                      />
                      <button onClick={handleCopyText} style={{ width: '100%', background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <Copy size={18} /> Copiar Texto Completo
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Study Metrics */}
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Seu Progresso</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          <div style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={24} color="#d97706" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {userProfile?.streakDays || 0}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>Dias seguidos</p>
            </div>
          </div>
          <div style={{ background: 'var(--surface-color)', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={24} color="#2563eb" />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {userProfile?.streakDays > 0 ? 'Ativo' : 'Inativo'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 500 }}>Status de Leitura</p>
            </div>
          </div>
        </div>

        {/* Modal de Escolha de Avatar */}
        {showAvatarModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 3000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', backdropFilter: 'blur(5px)'
          }}>
            <div style={{
              background: 'var(--surface-color)', width: '100%', maxWidth: '500px',
              borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Escolha seu Avatar</h3>
                <button onClick={() => setShowAvatarModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {predefinedAvatars.map((avatar, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleUpdateAvatar(avatar)}
                    style={{ 
                      aspectRatio: '1', borderRadius: '50%', background: '#f3f4f6', border: 'none', 
                      cursor: 'pointer', overflow: 'hidden', padding: 0, transition: 'transform 0.2s',
                      boxShadow: userProfile?.avatarId === avatar ? '0 0 0 4px var(--primary-color)' : 'none'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={avatar} alt={`Avatar ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
              <div style={{ padding: '16px 24px', background: 'var(--bg-color)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Selecione um dos avatares para atualizar seu perfil instantaneamente.</p>
              </div>
            </div>
          </div>
        )}

        {/* Library Section (Netflix Style) */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Sua Biblioteca</h3>
            <button
              onClick={handleRefreshMaterials}
              disabled={refreshing}
              style={{
                background: 'var(--surface-color)', border: '1px solid var(--border-color)',
                borderRadius: '12px', padding: '8px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
                transition: 'all 0.2s', opacity: refreshing ? 0.6 : 1
              }}
            >
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>

          {Object.entries(
            materials
              .filter((m: any) => {
                if (!searchQuery) return true
                const q = searchQuery.toLowerCase()
                return m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q)
              })
              .reduce((acc: any, material: any) => {
              const cat = material.category || 'GERAL';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(material);
              return acc;
            }, {})
          ).map(([category, items]: [string, any]) => {
            const categoryColors: Record<string, string> = {
              'LOJA': '#f59e0b', // gold/yellow for premium store
              'PREGADORES': '#d97706', // amber
              'MULHERES': '#db2777', // pink
              'JOVENS': '#2563eb', // blue
              'CÉLULAS': '#16a34a', // green
              'MAPAS': '#9333ea', // purple
              'ESTUDOS': '#0891b2', // cyan
              'CRIANÇAS': '#ea580c', // orange
              'ANCIÕES': '#475569', // slate
            };
            const catColor = categoryColors[category.toUpperCase()] || 'var(--text-primary)';

            return (
            <div key={category} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '18px', background: catColor, borderRadius: '4px' }}></div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: catColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {category}
                </h4>
              </div>
              <div className="hide-scrollbar" style={{ 
                display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px',
                scrollSnapType: 'x mandatory'
              }}>
                {items.map((material: any) => {
                  // LOJA = conteúdo pago. Todas as outras categorias = gratuito/livre
                  const isPago = material.category === 'LOJA'
                  return (
                  <div key={material.id} style={{ 
                    minWidth: '280px', maxWidth: '280px',
                    background: 'var(--surface-color)', borderRadius: '24px', overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column',
                    scrollSnapAlign: 'start', flexShrink: 0
                  }}>
                    <div style={{ height: '160px', backgroundImage: `url(${material.image})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                      {isPago && (
                        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', padding: '8px', borderRadius: '12px', color: 'var(--text-primary)' }}>
                          <Lock size={18} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: isPago ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {material.title}
                      </h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', flex: 1 }}>
                        {material.description}
                      </p>

                      {isPago ? (
                        <a href={material.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: '#f3f4f6', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', transition: 'var(--transition)' }}>
                          <MessageCircle size={18} color="#25D366" />
                          Adquirir ({material.price || 'Premium'})
                        </a>
                      ) : (
                        <button onClick={() => setReadingMaterial(material.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'var(--transition)' }}>
                          <PlayCircle size={18} />
                          Acessar Material
                        </button>
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
            );
          })}
        </div>
        </>
        )}

        {activeTab === 'bible' && !readingMaterial && <BibleReader />}

        {readingMaterial && (
          <MaterialReader
            materialId={readingMaterial}
            onBack={() => setReadingMaterial(null)}
          />
        )}

        {activeTab === 'profile' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'var(--surface-color)', padding: '32px 24px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
              <button 
                onClick={() => setShowAvatarModal(true)}
                style={{ 
                  width: '100px', height: '100px', borderRadius: '50%', 
                  background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', marginBottom: '16px', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  padding: 0, cursor: 'pointer', transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img src={userProfile?.avatarId || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email}`} alt="User" style={{ width: '100%' }} />
              </button>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', textTransform: 'capitalize', color: 'var(--text-primary)' }}>{displayName}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>{user.email}</p>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-color)', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
                <Trophy size={16} />
                Membro {user.role || 'Usuário'}
              </div>
            </div>

            <div style={{ background: 'var(--surface-color)', padding: '24px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Configurações da Conta</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div onClick={() => setShowPasswordModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-color)', borderRadius: '16px', cursor: 'pointer' }}>
                  <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
                    <Lock size={20} color="#d97706" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Segurança</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Alterar senha</p>
                  </div>
                </div>

                <div onClick={() => setShowNotificationsModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-color)', borderRadius: '16px', cursor: 'pointer' }}>
                  <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '12px' }}>
                    <Bell size={20} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Notificações</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Gerenciar alertas e mensagens</p>
                  </div>
                </div>

                <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#fee2e2', borderRadius: '16px', cursor: 'pointer', marginTop: '8px' }}>
                  <div style={{ background: '#fca5a5', padding: '10px', borderRadius: '12px' }}>
                    <LogOut size={20} color="#991b1b" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#991b1b' }}>Sair da Conta</h4>
                    <p style={{ fontSize: '13px', color: '#b91c1c' }}>Encerrar sessão no dispositivo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Alterar Senha */}
      {showPasswordModal && (
        <PasswordChangeModal
          onClose={() => setShowPasswordModal(false)}
          token={localStorage.getItem('token') || ''}
        />
      )}

      {/* Modal Notificações */}
      {showNotificationsModal && (
        <NotificationsModal
          onClose={() => setShowNotificationsModal(false)}
        />
      )}

      {/* Bottom Navigation (PWA style) */}
      {!readingMaterial && <nav style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface-color)', 
        padding: '16px 24px', display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', zIndex: 20
      }}>
        <div onClick={() => setActiveTab('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'home' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
          <Home size={24} />
          <span style={{ fontSize: '12px', fontWeight: activeTab === 'home' ? 600 : 500 }}>Início</span>
        </div>
        <div onClick={() => setActiveTab('bible')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'bible' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
          <BookOpen size={24} />
          <span style={{ fontSize: '12px', fontWeight: activeTab === 'bible' ? 600 : 500 }}>Bíblia</span>
        </div>
        <div onClick={() => setActiveTab('profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-secondary)' }}>
          <User size={24} />
          <span style={{ fontSize: '12px', fontWeight: activeTab === 'profile' ? 600 : 500 }}>Perfil</span>
        </div>
        <div onClick={handleLogout} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <LogOut size={24} />
          <span style={{ fontSize: '12px', fontWeight: 500 }}>Sair</span>
        </div>
      </nav>}
    </div>
  )
}
