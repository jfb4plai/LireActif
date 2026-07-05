import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase.js'

export default function SchoolOnboarding({ userId, onDone }) {
  const [schoolCode, setSchoolCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: school } = await supabase.from('lire_schools').select('id').eq('code', schoolCode.trim().toUpperCase()).maybeSingle()
    if (!school) { setError('Code école inconnu. Contactez le PLAI.'); setLoading(false); return }
    const { error: insertError } = await supabase.from('lire_teacher_schools').insert({ teacher_id: userId, school_id: school.id })
    if (insertError) { setError(insertError.message); setLoading(false); return }
    onDone(school.id)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-p-bg py-8">
      <div className="w-full max-w-sm space-y-4">
        <form onSubmit={handleSubmit} className="bg-white border border-p-bord rounded-[2px] p-8 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <img src="/plai-logo.jpg" alt="PLAI" className="h-10 w-auto" />
            <span className="text-sm font-bold text-p-noir">LireActif</span>
          </div>
          <h1 className="text-lg font-bold text-p-noir">Code école</h1>
          <div className="border border-p-bord border-l-[3px] border-l-p-rose bg-p-bg rounded-[2px] p-3 text-xs text-p-gris space-y-1.5">
            <p><strong className="text-p-noir">Pourquoi ce code ?</strong> Il confirme que votre établissement est accompagné par le PLAI et vous rattache à votre école.</p>
            <p>Vos profils élèves restent visibles par vous seul — ils ne sont jamais partagés, même avec vos collègues de la même école (RGPD).</p>
            <p><strong className="text-p-noir">Anonymisation obligatoire :</strong> prénom et initiale uniquement, jamais de nom complet ni de diagnostic.</p>
          </div>
          <div className="space-y-1">
            <label htmlFor="school-code" className="text-sm font-semibold text-p-noir">Code fourni par le PLAI</label>
            <input
              id="school-code"
              className="w-full border border-p-bord rounded-[2px] p-2.5 text-sm uppercase focus:outline-none focus:border-p-noir"
              value={schoolCode} onChange={e => setSchoolCode(e.target.value)}
              placeholder="EX: ECL-LGE-01" required
            />
            <p className="text-xs text-p-gris2">Un seul code par établissement, transmis par le PLAI lors de l'accompagnement.</p>
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-p-noir text-white py-2.5 rounded-[2px] font-semibold text-sm disabled:opacity-50 hover:bg-p-noir2 transition-colors">
            {loading ? 'Vérification…' : 'Rejoindre'}
          </button>
          <button type="button" onClick={() => supabase.auth.signOut()}
            className="w-full text-xs text-p-gris2 hover:text-p-gris transition-colors">
            Se déconnecter
          </button>
        </form>

        <div className="bg-white border border-p-bord rounded-[2px] p-6 space-y-3">
          <p className="text-sm font-bold text-p-noir">Pas encore de code ?</p>
          <p className="text-xs text-p-gris">
            Testez le lecteur RSVP et tous ses réglages en mode découverte — sans code, sans enregistrement.
            Vos essais ne sont pas sauvegardés.
          </p>
          <Link to="/demo"
            className="block w-full text-center border border-p-noir text-p-noir py-2.5 rounded-[2px] font-semibold text-sm hover:bg-p-noir hover:text-white transition-colors">
            Essayer le mode découverte
          </Link>
          <p className="text-xs text-p-gris2">
            Pour obtenir le code de votre établissement :{' '}
            <a href="mailto:jeanfrancois.beguin@ens.ecl.be?subject=LireActif%20—%20demande%20de%20code%20école"
              className="underline hover:text-p-rose transition-colors">
              contactez le PLAI
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
