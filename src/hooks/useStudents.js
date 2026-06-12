import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useAuth } from './useAuth.js'

export function useStudents() {
  const { user, schoolId } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!schoolId) return
    setLoading(true)
    supabase
      .from('student_profiles')
      .select('id, display_name, owner_id, created_at')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setStudents(data ?? [])
        setLoading(false)
      })
  }, [schoolId])

  async function createStudent(displayName) {
    const { data: ts } = await supabase
      .from('teacher_schools')
      .select('school_id')
      .eq('teacher_id', user.id)
      .single()

    const { data, error } = await supabase
      .from('student_profiles')
      .insert({ display_name: displayName, school_id: ts.school_id, owner_id: user.id })
      .select()
      .single()

    if (!error) setStudents(prev => [data, ...prev])
    return { data, error }
  }

  return { students, loading, createStudent, userId: user?.id }
}
