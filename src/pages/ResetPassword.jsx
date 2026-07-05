import { useState } from 'react'
import { supabase } from '../supabase.js'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const inputCls = 'w-full border border-p-bord rounded-[2px] p-2.5 text-sm focus:outline-none focus:border-p-noir transition-colors'
  const btnCls = 'w-full bg-p-noir text-white py-2.5 rounded-[2px] font-semibold text-sm disabled:opacity-50 hover:bg-p-noir2 transition-colors'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess('Mot de passe mis à jour. Redirection...')
    setTimeout(() => { window.location.href = '/' }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-p-bg">
      <form onSubmit={handleSubmit} className="bg-white border border-p-bord rounded-[2px] p-8 w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="/plai-logo.jpg" alt="PLAI" className="h-10 w-auto" />
          <span className="text-xs font-semibold text-p-noir tracking-wide">LireActif</span>
        </div>
        <h1 className="text-lg font-bold text-p-noir">Nouveau mot de passe</h1>
        <input type="password" className={inputCls} placeholder="Nouveau mot de passe"
          value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        {error && <p className="text-red-600 text-xs">{error}</p>}
        {success && <p className="text-green-600 text-xs">{success}</p>}
        <button type="submit" disabled={loading} className={btnCls}>
          {loading ? 'Mise à jour…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
