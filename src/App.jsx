import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import StudentProfile from './pages/StudentProfile.jsx'
import MySchool from './pages/MySchool.jsx'
import StudentAccess from './pages/StudentAccess.jsx'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement…</div>

  return (
    <Routes>
      <Route path="/eleve/:token" element={<StudentAccess />} />
      {!session ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
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
