import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase.js'
import RSVPReader from '../components/RSVPReader.jsx'
import PredictEditor from '../components/PredictEditor.jsx'

export default function StudentAccess() {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rsvp, setRsvp] = useState(null)
  const [tab, setTab] = useState('rsvp')

  useEffect(() => {
    async function load() {
      const { data: tokenRow, error: tokenError } = await supabase
        .from('student_tokens')
        .select('student_id, expires_at')
        .eq('token', token)
        .maybeSingle()

      if (tokenError || !tokenRow) { setError('Lien invalide ou expiré.'); setLoading(false); return }
      if (new Date(tokenRow.expires_at) < new Date()) {
        setError('Ce lien a expiré. Demande un nouveau lien à ton enseignant.')
        setLoading(false)
        return
      }

      const { data: r } = await supabase
        .from('rsvp_settings')
        .select('*')
        .eq('student_id', tokenRow.student_id)
        .maybeSingle()

      setRsvp(r ?? { wpm: 180, font_size: 36, chunk_size: 1, pause_punctuation: true, background: 'white' })
      setLoading(false)
    }
    load()
  }, [token])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-xl">Chargement…</div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <p className="text-xl text-gray-600 text-center">{error}</p>
    </div>
  )

  const bgClass = rsvp?.background === 'yellow' ? 'bg-[#e8d5a3]' : 'bg-white'

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex border-b">
          {['rsvp', 'predict'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-4 font-semibold text-lg border-b-2 -mb-px transition-colors ${tab === t ? 'border-p-rose text-p-noir' : 'border-transparent text-p-gris2'}`}>
              {t === 'rsvp' ? 'Lire' : 'Écrire'}
            </button>
          ))}
        </div>

        <div className="pt-2">
          {tab === 'rsvp'
            ? <RSVPReader settings={rsvp} />
            : <PredictEditor token={token} settings={rsvp} />
          }
        </div>
      </div>
    </div>
  )
}
