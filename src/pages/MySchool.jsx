import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth } from '../hooks/useAuth.js'
import Nav from '../components/Nav.jsx'

export default function MySchool() {
  const { schoolId } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return
    Promise.all([
      supabase.from('lire_schools').select('name, code').eq('id', schoolId).single(),
      supabase.from('lire_teacher_schools').select('teacher_id').eq('school_id', schoolId),
    ]).then(([{ data: s }, { data: ts }]) => {
      setSchool(s)
      setTeachers(ts ?? [])
      setLoading(false)
    })
  }, [schoolId])

  if (loading) return (
    <div className="min-h-screen bg-p-bg">
      <Nav />
      <p className="p-8 text-p-gris2 text-sm">Chargement…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-p-bg">
      <Nav />
      <div className="max-w-2xl mx-auto p-4 space-y-4 pt-6">
        <Link to="/" className="text-xs text-p-gris2 hover:text-p-rose transition-colors">← Retour</Link>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-p-rose">Établissement</p>
          <h1 className="text-2xl font-bold text-p-noir tracking-tight">Mon école</h1>
        </div>

        {school && (
          <div className="bg-white border border-p-bord border-l-[3px] border-l-p-rose rounded-[2px] p-4 space-y-1">
            <p className="font-semibold text-p-noir text-sm">{school.name}</p>
            <p className="text-xs text-p-gris">Code : <span className="font-mono font-semibold">{school.code}</span></p>
          </div>
        )}

        <div className="bg-white border border-p-bord rounded-[2px] p-4 space-y-2">
          <p className="text-sm font-semibold text-p-noir">
            {teachers.length} enseignant{teachers.length > 1 ? 's' : ''} connecté{teachers.length > 1 ? 's' : ''} à cette école
          </p>
          <p className="text-xs text-p-gris2">
            Tous partagent la lecture des profils élèves. Seul le créateur d'un profil peut le modifier.
          </p>
        </div>
      </div>
    </div>
  )
}
