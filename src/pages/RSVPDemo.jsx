import { useState } from 'react'
import { Link } from 'react-router-dom'
import RSVPSettings from '../components/RSVPSettings.jsx'
import RSVPReader from '../components/RSVPReader.jsx'

const SAMPLE = `La lecture est une activité complexe qui mobilise simultanément plusieurs processus cognitifs. Pour les élèves présentant des difficultés de décodage, la technique RSVP permet de réduire la charge liée aux mouvements oculaires en présentant les mots un par un au centre du champ visuel. L'enseignant peut adapter la vitesse, la taille de police et le fond selon les besoins de chaque élève.`

export default function RSVPDemo() {
  const [settings, setSettings] = useState({
    wpm: 180, font_size: 36, chunk_size: 1,
    pause_punctuation: true, background: 'white', show_context: false,
  })

  return (
    <div className="min-h-screen bg-p-bg">
      <nav className="sticky top-0 z-50 bg-white border-b border-p-bord">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <img src="/plai-logo.jpg" alt="PLAI" className="h-8 w-auto" />
            <div>
              <p className="text-xs font-bold text-p-noir tracking-tight">LireActif — Démo RSVP</p>
              <p className="text-[10px] font-medium text-p-gris2 uppercase tracking-widest">Sans compte requis</p>
            </div>
          </div>
          <Link to="/login" className="text-xs font-semibold bg-p-noir text-white px-3 py-1.5 rounded-[2px] hover:bg-p-noir2 transition-colors">
            Connexion →
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto p-4 space-y-5 pt-6">

        <div className="border border-p-bord border-l-[3px] border-l-p-rose bg-white rounded-[2px] p-4 text-sm text-p-gris">
          <p className="font-semibold text-p-noir mb-1">RSVP — Rapid Serial Visual Presentation</p>
          Les mots s'affichent un par un au centre de l'écran à vitesse fixe, éliminant les saccades oculaires gauche-droite.
          Chaque réglage ci-dessous est accompagné d'une note de recherche issue du <strong className="text-p-noir">corpus RISS</strong> (522 000+ articles francophones).
        </div>

        <div className="bg-white border border-p-bord rounded-[2px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-p-rose mb-4">Réglages</p>
          <RSVPSettings settings={settings} onChange={setSettings} />
        </div>

        <div className="bg-white border border-p-bord rounded-[2px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-p-rose mb-4">Lecteur</p>
          <RSVPReader settings={settings} defaultText={SAMPLE} />
        </div>

      </div>
    </div>
  )
}
