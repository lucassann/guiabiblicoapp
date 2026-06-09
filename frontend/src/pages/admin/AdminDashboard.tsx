import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, BookOpen, LogOut, Settings } from 'lucide-react'

export function AdminDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', backgroundColor: 'var(--surface-color)', borderRight: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ background: 'var(--primary-color)', color: '#fff', padding: '8px', borderRadius: '12px' }}>
            <BookOpen size={24} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Admin Panel</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button style={navItemStyle(true)}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button style={navItemStyle(false)}>
            <Users size={20} />
            Usuários
          </button>
          <button style={navItemStyle(false)}>
            <Settings size={20} />
            Configurações
          </button>
        </nav>

        <button onClick={handleLogout} style={{ ...navItemStyle(false), color: '#ef4444', marginTop: 'auto' }}>
          <LogOut size={20} />
          Sair
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '48px' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px' }}>Bem-vindo, Administrador</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Aqui você tem controle total sobre o sistema.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Stats Cards */}
          <div style={cardStyle}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Total de Usuários</h3>
            <p style={{ fontSize: '36px', fontWeight: 700 }}>1,204</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>Materiais Acessados</h3>
            <p style={{ fontSize: '36px', fontWeight: 700 }}>8,432</p>
          </div>
        </div>
      </main>
    </div>
  )
}

const navItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '12px',
  border: 'none',
  background: active ? '#f3f4f6' : 'transparent',
  color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'var(--transition)'
})

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-color)',
  padding: '24px',
  borderRadius: '24px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
  border: '1px solid #f3f4f6'
}
