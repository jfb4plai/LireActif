import { useState } from 'react'
import { supabase } from '../supabase.js'

export default function SchoolOnboarding({ userId, onDone }) {
  const [schoolCode, setSchoolCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: school } = await supabase.from('schools').select('id').eq('code', schoolCode.trim().toUpperCase()).maybeSingle()
    if (!school) { setError('Code école inconnu. Contactez le PLAI.'); setLoading(false); return }
    const { error: insertError } = await supabase.from('teacher_schools').insert({ teacher_id: userId, school_id: school.id })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    onDone(school.id)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-p-bg">
      <form onSubmit={handleSubmit} className="bg-white border border-p-bord rounded-[2px] p-8 w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="/plai-logo.png" alt="PLAI" className="h-10 w-auto" />
          <span className="text-sm font-bold text-p-noir">LireActif</span>
        </div>
        <h1 className="text-lg font-bold text-p-noir">Code école</h1>
        <p className="text-sm text-p-gris">Saisissez le code fourni par le PLAI pour rejoindre votre établissement.</p>
        <input
          className="w-full border border-p-bord rounded-[2px] p-2.5 text-sm uppercase focus:outline-none focus:border-p-noir"
          value={schoolCode} onChange={e => setSchoolCode(e.target.value)}
          placeholder="EX: ECL-LGE-01" required
        />
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full bg-p-noir text-white py-2.5 rounded-[2px] font-semibold text-sm disabled:opacity-50 hover:bg-p-noir2 transition-colors">
          {loading ? 'Vérification…' : 'Rejoindre'}
        </button>
        <button type="button" onClick={() => supabase.auth.signOut()}
          className="w-full text-xs text-p-gris2 hover:text-p-gris transition-colors">
          Se déconnecter
        </button>
      </form>
    </div>
  )
}
