import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useAuth } from '../hooks/useAuth.js'

export default function MySchool() {
  const { schoolId } = useAuth()
  const [teachers, setTeachers] = useState([])
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return
    Promise.all([
      supabase.from('schools').select('name, code').eq('id', schoolId).single(),
      supabase.from('teacher_schools').select('teacher_id').eq('school_id', schoolId),
    ]).then(([{ data: s }, { data: ts }]) => {
      setSchool(s)
      setTeachers(ts ?? [])
      setLoading(false)
    })
  }, [schoolId])

  if (loading) return <div className="p-8 text-gray-400">Chargement…</div>

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Link to="/" className="text-sm text-gray-400 underline">← Retour</Link>
      <h1 className="text-2xl font-bold text-[#0a9370]">Mon école</h1>
      {school && (
        <div className="bg-white border rounded-xl p-4 space-y-1">
          <p className="font-semibold">{school.name}</p>
          <p className="text-sm text-gray-500">Code : <span className="font-mono">{school.code}</span></p>
        </div>
      )}
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          {teachers.length} enseignant{teachers.length > 1 ? 's' : ''} connecté{teachers.length > 1 ? 's' : ''} à cette école
        </p>
        <p className="text-xs text-gray-400">
          Tous partagent la lecture des profils élèves. Seul le créateur d'un profil peut le modifier.
        </p>
      </div>
    </div>
  )
}
