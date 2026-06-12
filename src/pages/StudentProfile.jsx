import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth } from '../hooks/useAuth.js'
import RSVPSettings from '../components/RSVPSettings.jsx'
import PredictSettings from '../components/PredictSettings.jsx'
import TokenModal from '../components/TokenModal.jsx'
import ExportPDF from '../components/ExportPDF.jsx'

export default function StudentProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [student, setStudent] = useState(null)
  const [rsvp, setRsvp] = useState(null)
  const [predict, setPredict] = useState(null)
  const [tab, setTab] = useState('rsvp')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isOwner = student?.owner_id === user?.id

  useEffect(() => {
    Promise.all([
      supabase.from('student_profiles').select('*').eq('id', id).single(),
      supabase.from('rsvp_settings').select('*').eq('student_id', id).maybeSingle(),
      supabase.from('predict_settings').select('*').eq('student_id', id).maybeSingle(),
    ]).then(([{ data: s }, { data: r }, { data: p }]) => {
      setStudent(s)
      setRsvp(r ?? { wpm: 180, font_size: 36, chunk_size: 1, pause_punctuation: true, background: 'white' })
      setPredict(p ?? { domain_vocab: [], context_note: '', lang: 'fr' })
    })
  }, [id])

  async function saveSettings() {
    if (!isOwner) return
    setSaving(true)
    const rsvpPayload = { ...rsvp, student_id: id, owner_id: user.id }
    const predPayload = { ...predict, student_id: id, owner_id: user.id }

    await Promise.all([
      supabase.from('rsvp_settings').upsert(rsvpPayload, { onConflict: 'student_id' }),
      supabase.from('predict_settings').upsert(predPayload, { onConflict: 'student_id' }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!student) return <div className="p-8 text-gray-400">Chargement…</div>

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <button onClick={() => navigate('/')} className="text-sm text-gray-400 underline">← Retour</button>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        LireActif stocke un prénom et une initiale. Conservez dans vos fichiers la correspondance avec l'identité réelle de l'élève.
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{student.display_name}</h1>
          {isOwner
            ? <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded">Propriétaire</span>
            : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Lecture seule</span>}
        </div>
        <div className="flex gap-2">
          {isOwner && <button onClick={() => setShowToken(true)}
            className="text-sm bg-[#f97316] text-white px-3 py-1.5 rounded-lg font-semibold">
            Accès élève
          </button>}
          <ExportPDF student={student} rsvp={rsvp} predict={predict} />
        </div>
      </div>

      <div className="flex border-b">
        {['rsvp', 'predict'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-3 font-semibold text-sm border-b-2 -mb-px transition-colors ${tab === t ? 'border-[#0a9370] text-[#0a9370]' : 'border-transparent text-gray-500'}`}>
            {t === 'rsvp' ? 'RSVP' : 'Prédiction'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-4">
        {tab === 'rsvp'
          ? <RSVPSettings settings={rsvp} onChange={setRsvp} readOnly={!isOwner} />
          : <PredictSettings settings={predict} onChange={setPredict} readOnly={!isOwner} />
        }
      </div>

      {isOwner && (
        <button onClick={saveSettings} disabled={saving}
          className="w-full bg-[#0a9370] text-white py-3 rounded-lg font-semibold disabled:opacity-50">
          {saving ? 'Enregistrement…' : saved ? '✓ Enregistré' : 'Enregistrer les réglages'}
        </button>
      )}

      {showToken && <TokenModal studentId={id} onClose={() => setShowToken(false)} />}
    </div>
  )
}
