import { useState } from 'react'
import { generateStudentPDF } from '../lib/pdf.js'

export default function ExportPDF({ student, rsvp, predict }) {
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)

  function handleExport() {
    generateStudentPDF({ student, rsvp, predict, note })
    setShowNote(false)
    setNote('')
  }

  return (
    <>
      <button onClick={() => setShowNote(true)}
        className="text-xs border border-p-bord text-p-gris px-3 py-1.5 rounded-[2px] hover:border-p-gris transition-colors">
        Fiche PDF
      </button>

      {showNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-p-bord rounded-[2px] max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-p-noir">Fiche PDF</h2>
            <div>
              <label className="text-xs font-medium text-p-gris">Note libre (optionnelle — non stockée)</label>
              <textarea
                className="w-full border border-p-bord rounded-[2px] p-2 mt-1 resize-none h-24 text-sm focus:outline-none focus:border-p-noir"
                placeholder="Observations, stratégies efficaces, contexte classe…"
                value={note} onChange={e => setNote(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport}
                className="flex-1 bg-p-noir text-white py-2 rounded-[2px] text-sm font-semibold hover:bg-p-noir2 transition-colors">
                Télécharger PDF
              </button>
              <button onClick={() => setShowNote(false)}
                className="px-4 py-2 border border-p-bord rounded-[2px] text-sm text-p-gris hover:border-p-gris transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
