import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudents } from '../hooks/useStudents.js'
import { useAuth } from '../hooks/useAuth.js'

export default function Dashboard() {
  const { students, loading, createStudent, userId } = useStudents()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const filtered = students.filter(s =>
    s.display_name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const { data } = await createStudent(newName.trim())
    setCreating(false)
    setShowForm(false)
    setNewName('')
    if (data) navigate(`/eleve-profil/${data.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0a9370]">LireActif</h1>
        <div className="flex gap-2">
          <Link to="/mon-ecole" className="text-sm text-gray-500 underline">Mon école</Link>
          <button onClick={signOut} className="text-sm text-gray-400 underline">Déconnexion</button>
        </div>
      </div>

      <input className="w-full border rounded-lg p-3 text-base" placeholder="Rechercher un élève…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? (
        <p className="text-gray-400 text-center py-8">Chargement…</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <Link key={s.id} to={`/eleve-profil/${s.id}`}
              className="flex justify-between items-center bg-white border rounded-lg p-4 hover:border-[#0a9370] transition-colors">
              <span className="font-medium">{s.display_name}</span>
              {s.owner_id === userId && (
                <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded">Propriétaire</span>
              )}
            </Link>
          ))}
          {filtered.length === 0 && !showForm && (
            <p className="text-gray-400 text-center py-4">Aucun élève trouvé.</p>
          )}
        </div>
      )}

      {showForm ? (
        <form onSubmit={handleCreate} className="flex gap-2">
          <input className="flex-1 border rounded-lg p-3" placeholder="Prénom I. (ex: Marie D.)"
            value={newName} onChange={e => setNewName(e.target.value)} required autoFocus />
          <button type="submit" disabled={creating}
            className="bg-[#0a9370] text-white px-4 rounded-lg font-semibold disabled:opacity-50">
            {creating ? '…' : 'Créer'}
          </button>
          <button type="button" onClick={() => setShowForm(false)}
            className="px-4 py-2 border rounded-lg text-gray-500">Annuler</button>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-[#0a9370] text-[#0a9370] py-3 rounded-lg font-semibold hover:bg-teal-50">
          + Nouveau profil élève
        </button>
      )}
    </div>
  )
}
