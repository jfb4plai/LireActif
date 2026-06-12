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
        className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg">
        Fiche PDF
      </button>

      {showNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold">Fiche PDF</h2>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Note libre (optionnelle, 3 lignes max — non stockée)
              </label>
              <textarea
                className="w-full border rounded-lg p-2 mt-1 resize-none h-24 text-sm"
                placeholder="Observations, stratégies efficaces, contexte classe…"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport}
                className="flex-1 bg-[#0a9370] text-white py-2 rounded-lg font-semibold">
                Télécharger PDF
              </button>
              <button onClick={() => setShowNote(false)}
                className="px-4 py-2 border rounded-lg text-gray-500">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
