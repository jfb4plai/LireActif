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

    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('code', schoolCode.trim().toUpperCase())
      .maybeSingle()

    if (!school) {
      setError('Code école inconnu. Contactez le PLAI.')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('teacher_schools')
      .insert({ teacher_id: userId, school_id: school.id })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    onDone(school.id)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-[#0a9370]">Code école</h1>
        <p className="text-sm text-gray-600">
          Saisissez le code fourni par le PLAI pour rejoindre votre établissement.
        </p>
        <input
          className="w-full border rounded p-2 text-lg uppercase"
          value={schoolCode}
          onChange={e => setSchoolCode(e.target.value)}
          placeholder="EX: ECL-LGE-01"
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0a9370] text-white py-2 rounded font-semibold disabled:opacity-50"
        >
          {loading ? 'Vérification…' : 'Rejoindre'}
        </button>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="w-full text-sm text-gray-400 hover:text-gray-600"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  )
}
