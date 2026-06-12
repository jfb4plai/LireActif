import { useState } from 'react'
import { supabase } from '../supabase.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'school'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingUserId, setPendingUserId] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }

    // Check if teacher has a school
    const { data: ts } = await supabase
      .from('teacher_schools')
      .select('school_id')
      .eq('teacher_id', data.user.id)
      .maybeSingle()

    if (!ts) {
      setPendingUserId(data.user.id)
      setMode('school')
    }
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
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode.trim().toUpperCase())
      .maybeSingle()

    if (!school) { setError('Code école inconnu. Contactez le PLAI.'); setLoading(false); return }

    const userId = pendingUserId || (await supabase.auth.getUser()).data.user?.id
    await supabase.from('teacher_schools').insert({ teacher_id: userId, school_id: school.id })
    setLoading(false)
    window.location.href = '/'
  }

  if (mode === 'school') return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSchoolCode} className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-[#0a9370]">Code école</h1>
        <p className="text-sm text-gray-600">Saisissez le code fourni par le PLAI pour rejoindre votre établissement.</p>
        <input className="w-full border rounded p-2 text-lg uppercase" value={schoolCode}
          onChange={e => setSchoolCode(e.target.value)} placeholder="EX: ECL-LGE-01" required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-[#0a9370] text-white py-2 rounded font-semibold disabled:opacity-50">
          {loading ? 'Vérification…' : 'Rejoindre'}
        </button>
      </form>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={mode === 'login' ? handleLogin : handleSignup}
        className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-[#0a9370]">LireActif</h1>
        <input type="email" className="w-full border rounded p-2" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" className="w-full border rounded p-2" placeholder="Mot de passe"
          value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-[#0a9370] text-white py-2 rounded font-semibold disabled:opacity-50">
          {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full text-sm text-gray-500 underline">
          {mode === 'login' ? 'Créer un compte' : 'Déjà un compte ?'}
        </button>
      </form>
    </div>
  )
}
