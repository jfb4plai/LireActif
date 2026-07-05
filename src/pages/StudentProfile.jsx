import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth } from '../hooks/useAuth.js'
import RSVPSettings from '../components/RSVPSettings.jsx'
import PredictSettings from '../components/PredictSettings.jsx'
import TokenModal from '../components/TokenModal.jsx'
import ExportPDF from '../components/ExportPDF.jsx'
import Nav from '../components/Nav.jsx'

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [student, setStudent] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [rsvp, setRsvp] = useState(null)
  const [predict, setPredict] = useState(null)
  const [tab, setTab] = useState('rsvp')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      supabase.from('lire_student_profiles').select('*').eq('id', id).maybeSingle(),
      supabase.from('lire_rsvp_settings').select('*').eq('student_id', id).maybeSingle(),
      supabase.from('lire_predict_settings').select('*').eq('student_id', id).maybeSingle(),
    ]).then(([{ data: s }, { data: r }, { data: p }]) => {
      if (!s) { setNotFound(true); return }
      setStudent(s)
      setRsvp(r ?? { wpm: 180, font_size: 36, chunk_size: 1, pause_punctuation: true, background: 'white', show_context: false })
      setPredict(p ?? { domain_vocab: [], context_note: '', lang: 'fr' })
    })
  }, [id])

  async function saveSettings() {
    setSaving(true)
    await Promise.all([
      supabase.from('lire_rsvp_settings').upsert({ ...rsvp, student_id: id, owner_id: user.id }, { onConflict: 'student_id' }),
      supabase.from('lire_predict_settings').upsert({ ...predict, student_id: id, owner_id: user.id }, { onConflict: 'student_id' }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (notFound) return (
    <div className="min-h-screen bg-p-bg">
      <Nav />
      <div className="max-w-2xl mx-auto p-4 pt-6 space-y-3">
        <p className="text-sm text-p-gris">Profil introuvable, ou vous n'y avez pas accès.</p>
        <button onClick={() => navigate('/')} className="text-xs text-p-rose hover:underline">← Retour à mes élèves</button>
      </div>
    </div>
  )

  if (!student) return (
    <div className="min-h-screen bg-p-bg">
      <Nav />
      <p className="p-8 text-p-gris2 text-sm">Chargement…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-p-bg">
      <Nav />
      <div className="max-w-2xl mx-auto p-4 space-y-4 pt-6">

        <button onClick={() => navigate('/')} className="text-xs text-p-gris2 hover:text-p-rose transition-colors">← Retour</button>

        <div className="bg-amber-50 border border-amber-200 rounded-[2px] p-3 text-xs text-amber-800">
          LireActif stocke un prénom et une initiale. Conservez dans vos fichiers la correspondance avec l'identité réelle de l'élève.
        </div>

        <div className="flex justify-between items-start">
          <h1 className="text-xl font-bold text-p-noir tracking-tight">{student.display_name}</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowToken(true)}
              className="text-xs bg-p-rose text-white px-3 py-1.5 rounded-[2px] font-semibold hover:bg-p-rose-dk transition-colors">
              Accès élève
            </button>
            <ExportPDF student={student} rsvp={rsvp} predict={predict} />
          </div>
        </div>

        <div className="flex border-b border-p-bord">
          {['rsvp', 'predict'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t ? 'border-p-rose text-p-noir' : 'border-transparent text-p-gris2'}`}>
              {t === 'rsvp' ? 'RSVP' : 'Prédiction'}
            </button>
          ))}
        </div>

        <div className="bg-white border border-p-bord rounded-[2px] p-4">
          {tab === 'rsvp'
            ? <RSVPSettings settings={rsvp} onChange={setRsvp} />
            : <PredictSettings settings={predict} onChange={setPredict} />}
        </div>

        <button onClick={saveSettings} disabled={saving}
          className="w-full bg-p-noir text-white py-3 rounded-[2px] font-semibold text-sm disabled:opacity-50 hover:bg-p-noir2 transition-colors">
          {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer les réglages'}
        </button>

        {showToken && <TokenModal studentId={id} onClose={() => setShowToken(false)} />}
      </div>
    </div>
  )
}
