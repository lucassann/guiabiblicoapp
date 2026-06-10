import { useState } from 'react'

export function PasswordChangeModal({ onClose, token }: { onClose: () => void; token: string }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Nova senha e confirmação não conferem')
      return
    }
    if (newPassword.length < 3) {
      setError('Nova senha deve ter no mínimo 3 caracteres')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3333/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao alterar senha')
      setSuccess('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(onClose, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface-color)', width: '100%', maxWidth: '440px',
        borderRadius: '24px', padding: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Alterar Senha</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '20px' }}>&times;</button>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '12px', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ background: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '12px', fontSize: '14px', marginBottom: '16px' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Senha atual</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', background: '#f9fafb' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Nova senha</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', background: '#f9fafb' }} />
          </div>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Confirmar nova senha</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '15px', background: '#f9fafb' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Alterando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}

export function NotificationsModal({ onClose }: { onClose: () => void }) {
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('notif_prefs')
    return saved ? JSON.parse(saved) : {
      dailyBread: true,
      newMaterial: true,
      streakReminder: true,
      studyTip: false
    }
  })

  const toggle = (key: string) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    localStorage.setItem('notif_prefs', JSON.stringify(updated))
  }

  const items = [
    { key: 'dailyBread', label: 'Pão Diário', desc: 'Lembrete diário para ler o devocional' },
    { key: 'newMaterial', label: 'Novos Materiais', desc: 'Notificar quando novos estudos forem adicionados' },
    { key: 'streakReminder', label: 'Sequência de Dias', desc: 'Lembrete para não perder sua sequência' },
    { key: 'studyTip', label: 'Dicas de Estudo', desc: 'Dicas e curiosidades bíblicas' },
  ]

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--surface-color)', width: '100%', maxWidth: '440px',
        borderRadius: '24px', padding: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Notificações</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '20px' }}>&times;</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Gerencie quais notificações você deseja receber.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {items.map(item => (
            <div key={item.key} onClick={() => toggle(item.key)} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 12px', borderRadius: '14px', cursor: 'pointer', background: prefs[item.key] ? '#f0fdf4' : 'transparent', transition: 'background 0.2s' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${prefs[item.key] ? '#16a34a' : '#d1d5db'}`,
                background: prefs[item.key] ? '#16a34a' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0
              }}>
                {prefs[item.key] && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>&#10003;</span>}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '20px' }}>
          Preferências salvas automaticamente no dispositivo.
        </p>
      </div>
    </div>
  )
}