import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import Login from './pages/Login.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import StudentProfile from './pages/StudentProfile.jsx'
import MySchool from './pages/MySchool.jsx'
import StudentAccess from './pages/StudentAccess.jsx'
import SchoolOnboarding from './pages/SchoolOnboarding.jsx'
import RSVPDemo from './pages/RSVPDemo.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [schoolId, setSchoolId] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (!s) setSchoolId(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    supabase.from('lire_teacher_schools').select('school_id').eq('teacher_id', session.user.id).maybeSingle()
      .then(({ data }) => setSchoolId(data?.school_id ?? null))
  }, [session])

  if (session === undefined || (session && schoolId === undefined)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement…</div>
  }

  return (
    <Routes>
      <Route path="/demo" element={<RSVPDemo />} />
      <Route path="/eleve/:token" element={<StudentAccess />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {!session ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : !schoolId && session.user.email !== 'jeanfrancois.beguin@ens.ecl.be' ? (
        <>
          <Route path="/onboarding" element={<SchoolOnboarding userId={session.user.id} onDone={id => setSchoolId(id)} />} />
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/eleve-profil/:id" element={<StudentProfile />} />
          <Route path="/mon-ecole" element={<MySchool />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}
