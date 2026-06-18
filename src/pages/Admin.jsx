import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import Nav from '../components/Nav.jsx'

const ADMIN_EMAIL = 'jeanfrancois.beguin@ens.ecl.be'

function genCode() {
  const prefix = ['ECL', 'ATH', 'HUY', 'VER', 'ANS', 'SPA', 'PLO'][Math.floor(Math.random() * 7)]
  const num = String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')
  return `${prefix}-LGE-${num}`
}

export default function Admin() {
  const [user, setUser] = useState(undefined)
  const [schools, setSchools] = useState([])
  const [selected, setSelected] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [loadingSchools, setLoadingSchools] = useState(true)
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState(genCode())
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (!user) navigate('/login', { replace: true })
    })
  }, [])

  useEffect(() => {
    loadSchools()
  }, [])

  async function loadSchools() {
    setLoadingSchools(true)
    const { data } = await supabase
      .from('lire_schools')
      .select('id, name, code')
      .order('name')
    // Pour chaque école, compter les enseignants
    if (data) {
      const withCounts = await Promise.all(data.map(async s => {
        const { count } = await supabase
          .from('lire_teacher_schools')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', s.id)
        return { ...s, count: count ?? 0 }
      }))
      setSchools(withCounts)
    }
    setLoadingSchools(false)
  }

  async function loadTeachers(school) {
    setSelected(school)
    setTeachers([])
    setLoadingTeachers(true)
    const { data } = await supabase
      .from('lire_teacher_schools')
      .select('teacher_id')
      .eq('school_id', school.id)
    // Récupérer les emails via auth.users n'est pas accessible côté client RLS
    // On affiche les UUIDs — pour les emails, passer par Supabase dashboard
    setTeachers(data ?? [])
    setLoadingTeachers(false)
  }

  async function removeTeacher(teacherId) {
    if (!confirm('Retirer cet enseignant de l\'école ?')) return
    await supabase
      .from('lire_teacher_schools')
      .delete()
      .eq('school_id', selected.id)
      .eq('teacher_id', teacherId)
    setTeachers(t => t.filter(x => x.teacher_id !== teacherId))
    setSchools(s => s.map(sc => sc.id === selected.id ? { ...sc, count: sc.count - 1 } : sc))
  }

  async function createSchool(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)
    const code = newCode.trim().toUpperCase()
    const name = newName.trim()
    const { error: err } = await supabase.from('lire_schools').insert({ name, code })
    if (err) {
      setError(err.message)
    } else {
      setSuccess(`École "${name}" créée avec le code ${code}`)
      setNewName('')
      setNewCode(genCode())
      loadSchools()
    }
    setCreating(false)
  }

  if (user === undefined || user === null) return <div className="min-h-screen bg-p-bg flex items-center justify-center text-p-gris2 text-sm">Chargement…</div>
  if (user.email !== ADMIN_EMAIL) return (
    <div className="min-h-screen bg-p-bg flex items-center justify-center">
      <p className="text-sm text-p-gris2">Accès réservé à l'administrateur PLAI.</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-p-bg">
      <Nav />
      <div className="max-w-3xl mx-auto p-4 pt-6 space-y-6">

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-p-rose">Administration</p>
          <h1 className="text-2xl font-bold text-p-noir tracking-tight">Gestion des écoles</h1>
        </div>

        {/* Créer une école */}
        <div className="bg-white border border-p-bord rounded-[2px] p-5 space-y-3">
          <p className="text-sm font-semibold text-p-noir">Créer une école</p>
          <form onSubmit={createSchool} className="space-y-3">
            <div>
              <label className="text-xs text-p-gris block mb-1">Nom de l'établissement</label>
              <input
                className="w-full border border-p-bord rounded-[2px] p-2.5 text-sm focus:outline-none focus:border-p-noir"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Ex: École Communale de Glain"
                required
              />
            </div>
            <div>
              <label className="text-xs text-p-gris block mb-1">Code (modifiable)</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-p-bord rounded-[2px] p-2.5 text-sm font-mono uppercase focus:outline-none focus:border-p-noir"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setNewCode(genCode())}
                  className="px-3 text-xs border border-p-bord rounded-[2px] text-p-gris hover:text-p-noir transition-colors">
                  Générer
                </button>
              </div>
              <p className="text-[11px] text-p-gris2 mt-1">Ce code sera donné aux enseignants pour rejoindre l'école.</p>
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
            {success && <p className="text-green-700 text-xs">{success}</p>}
            <button type="submit" disabled={creating}
              className="bg-p-noir text-white px-4 py-2 rounded-[2px] text-sm font-semibold disabled:opacity-50 hover:bg-p-noir2 transition-colors">
              {creating ? 'Création…' : 'Créer l\'école'}
            </button>
          </form>
        </div>

        {/* Liste des écoles */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-p-noir">
            {loadingSchools ? 'Chargement…' : `${schools.length} école${schools.length > 1 ? 's' : ''}`}
          </p>
          {schools.map(s => (
            <div key={s.id}
              className={`bg-white border rounded-[2px] p-4 cursor-pointer transition-colors ${selected?.id === s.id ? 'border-p-noir' : 'border-p-bord hover:border-p-gris'}`}
              onClick={() => selected?.id === s.id ? setSelected(null) : loadTeachers(s)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-p-noir">{s.name}</p>
                  <p className="text-xs text-p-gris">
                    Code : <span className="font-mono font-semibold">{s.code}</span>
                    {' · '}
                    {s.count} enseignant{s.count > 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-xs text-p-gris2">{selected?.id === s.id ? '▲' : '▼'}</span>
              </div>

              {selected?.id === s.id && (
                <div className="mt-3 pt-3 border-t border-p-bord space-y-2" onClick={e => e.stopPropagation()}>
                  {loadingTeachers ? (
                    <p className="text-xs text-p-gris2">Chargement…</p>
                  ) : teachers.length === 0 ? (
                    <p className="text-xs text-p-gris2">Aucun enseignant rattaché.</p>
                  ) : teachers.map(t => (
                    <div key={t.teacher_id} className="flex items-center justify-between">
                      <p className="text-xs font-mono text-p-gris">{t.teacher_id}</p>
                      <button
                        onClick={() => removeTeacher(t.teacher_id)}
                        className="text-[11px] text-red-500 hover:text-red-700 transition-colors">
                        Retirer
                      </button>
                    </div>
                  ))}
                  <p className="text-[11px] text-p-gris2 pt-1">
                    Pour voir les emails, ouvrir le dashboard Supabase → Authentication → Users.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
