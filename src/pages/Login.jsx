import { useState } from 'react'
import { supabase } from '../supabase.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingUserId, setPendingUserId] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    const { data: ts } = await supabase.from('lire_teacher_schools').select('school_id').eq('teacher_id', data.user.id).maybeSingle()
    if (!ts) { setPendingUserId(data.user.id); setMode('school') }
    setLoading(false)
  }

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    setPendingUserId(data.user.id)
    setMode('school')
    setLoading(false)
  }

  async function handleSchoolCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: school } = await supabase.from('lire_schools').select('id').eq('code', schoolCode.trim().toUpperCase()).maybeSingle()
    if (!school) { setError('Code école inconnu. Contactez le PLAI.'); setLoading(false); return }
    const userId = pendingUserId || (await supabase.auth.getUser()).data.user?.id
    await supabase.from('lire_teacher_schools').insert({ teacher_id: userId, school_id: school.id })
    setLoading(false)
    window.location.href = '/'
  }

  const inputCls = 'w-full border border-p-bord rounded-[2px] p-2.5 text-sm focus:outline-none focus:border-p-noir transition-colors'
  const btnCls = 'w-full bg-p-noir text-white py-2.5 rounded-[2px] font-semibold text-sm disabled:opacity-50 hover:bg-p-noir2 transition-colors'

  if (mode === 'school') return (
    <div className="min-h-screen flex items-center justify-center bg-p-bg">
      <form onSubmit={handleSchoolCode} className="bg-white border border-p-bord rounded-[2px] p-8 w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="/plai-logo.jpg" alt="PLAI" className="h-10 w-auto" />
          <span className="text-xs font-semibold text-p-noir tracking-wide">LireActif</span>
        </div>
        <h1 className="text-lg font-bold text-p-noir">Code école</h1>
        <p className="text-sm text-p-gris">Saisissez le code fourni par le PLAI pour rejoindre votre établissement.</p>
        <input className={inputCls + ' uppercase'} value={schoolCode}
          onChange={e => setSchoolCode(e.target.value)} placeholder="EX: ECL-LGE-01" required />
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? 'Vérification…' : 'Rejoindre'}
        </button>
      </form>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-p-bg">
      <form onSubmit={mode === 'login' ? handleLogin : handleSignup}
        className="bg-white border border-p-bord rounded-[2px] p-8 w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="/plai-logo.jpg" alt="PLAI" className="h-10 w-auto" />
          <div>
            <p className="text-sm font-bold text-p-noir tracking-tight">LireActif</p>
            <p className="text-[10px] font-medium text-p-gris2 uppercase tracking-widest">PLAI — Liège</p>
          </div>
        </div>
        <input type="email" className={inputCls} placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className={inputCls} placeholder="Mot de passe"
          value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full text-xs text-p-gris hover:text-p-rose transition-colors">
          {mode === 'login' ? 'Créer un compte' : 'Déjà un compte ?'}
        </button>
      </form>
    </div>
  )
}
