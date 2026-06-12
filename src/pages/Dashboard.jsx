import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudents } from '../hooks/useStudents.js'
import Nav from '../components/Nav.jsx'

export default function Dashboard() {
  const { students, loading, createStudent, userId } = useStudents()
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
    <div className="min-h-screen bg-p-bg">
      <Nav />
      <div className="max-w-2xl mx-auto p-4 space-y-4 pt-6">

        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-p-rose">Profils élèves</p>
            <h1 className="text-2xl font-bold text-p-noir tracking-tight">LireActif</h1>
          </div>
        </div>

        <input
          className="w-full border border-p-bord rounded-[2px] p-3 text-sm bg-white focus:outline-none focus:border-p-noir"
          placeholder="Rechercher un élève…"
          value={search} onChange={e => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-p-gris2 text-center py-8 text-sm">Chargement…</p>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(s => (
              <Link key={s.id} to={`/eleve-profil/${s.id}`}
                className="flex justify-between items-center bg-white border border-p-bord rounded-[2px] px-4 py-3 hover:border-p-rose hover:border-l-[3px] transition-all">
                <span className="text-sm font-medium text-p-noir">{s.display_name}</span>
                {s.owner_id === userId && (
                  <span className="text-[10px] font-semibold bg-p-beige text-p-rose-dk px-2 py-0.5 rounded-[2px] uppercase tracking-wide">Propriétaire</span>
                )}
              </Link>
            ))}
            {filtered.length === 0 && !showForm && (
              <p className="text-p-gris2 text-center py-6 text-sm">Aucun élève trouvé.</p>
            )}
          </div>
        )}

        {showForm ? (
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              className="flex-1 border border-p-bord rounded-[2px] p-2.5 text-sm focus:outline-none focus:border-p-noir"
              placeholder="Prénom I. (ex: Marie D.)"
              value={newName} onChange={e => setNewName(e.target.value)} required autoFocus
            />
            <button type="submit" disabled={creating}
              className="bg-p-noir text-white px-4 rounded-[2px] text-sm font-semibold disabled:opacity-50 hover:bg-p-noir2">
              {creating ? '…' : 'Créer'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-p-bord rounded-[2px] text-sm text-p-gris hover:border-p-gris">
              Annuler
            </button>
          </form>
        ) : (
          <button onClick={() => setShowForm(true)}
            className="w-full border border-dashed border-p-bord text-p-gris py-3 rounded-[2px] text-sm font-medium hover:border-p-rose hover:text-p-rose transition-colors">
            + Nouveau profil élève
          </button>
        )}
      </div>
    </div>
  )
}
