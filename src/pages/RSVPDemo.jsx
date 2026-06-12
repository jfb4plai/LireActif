import { useState } from 'react'
import { Link } from 'react-router-dom'
import RSVPSettings from '../components/RSVPSettings.jsx'
import RSVPReader from '../components/RSVPReader.jsx'

const SAMPLE = `La lecture est une activité complexe qui mobilise simultanément plusieurs processus cognitifs. Pour les élèves présentant des difficultés de décodage, la technique RSVP permet de réduire la charge liée aux mouvements oculaires en présentant les mots un par un au centre du champ visuel. L'enseignant peut adapter la vitesse, la taille de police et le fond selon les besoins de chaque élève.`

export default function RSVPDemo() {
  const [settings, setSettings] = useState({
    wpm: 180,
    font_size: 36,
    chunk_size: 1,
    pause_punctuation: true,
    background: 'white',
  })

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0a9370]">Demo RSVP</h1>
        <Link to="/login" className="text-sm text-gray-400 underline">Connexion →</Link>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-800">
        <strong>RSVP</strong> — Rapid Serial Visual Presentation. Les mots s'affichent un par un au centre de l'écran, à vitesse fixe. Aucun compte requis pour ce test.
      </div>

      <div className="bg-white rounded-xl border p-4 space-y-4">
        <p className="text-sm font-semibold text-gray-700">Réglages</p>
        <RSVPSettings settings={settings} onChange={setSettings} />
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Lecteur</p>
        <RSVPReader settings={settings} defaultText={SAMPLE} />
      </div>
    </div>
  )
}
