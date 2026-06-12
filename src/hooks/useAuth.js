import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [schoolId, setSchoolId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!mounted) return
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('teacher_schools')
          .select('school_id')
          .eq('teacher_id', user.id)
          .maybeSingle()
        setSchoolId(data?.school_id ?? null)
      }
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const signOut = () => supabase.auth.signOut()

  return { user, schoolId, loading, signOut }
}
