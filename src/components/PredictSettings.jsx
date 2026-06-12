import { useState } from 'react'

export default function PredictSettings({ settings, onChange, readOnly = false }) {
  const s = settings ?? { domain_vocab: [], context_note: '', lang: 'fr' }
  const [vocabInput, setVocabInput] = useState('')

  function addVocab() {
    const word = vocabInput.trim()
    if (!word || s.domain_vocab.includes(word)) { setVocabInput(''); return }
    onChange({ ...s, domain_vocab: [...s.domain_vocab, word] })
    setVocabInput('')
  }

  function removeVocab(word) {
    onChange({ ...s, domain_vocab: s.domain_vocab.filter(w => w !== word) })
  }

  if (readOnly) return (
    <div className="space-y-3 text-gray-700">
      <Row label="Langue">{s.lang === 'nl' ? 'Néerlandais' : 'Français'}</Row>
      <Row label="Contexte">{s.context_note || '—'}</Row>
      <div>
        <p className="text-sm text-gray-500 mb-1">Vocabulaire</p>
        <div className="flex flex-wrap gap-1">
          {s.domain_vocab.map(w => <span key={w} className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded text-sm">{w}</span>)}
          {s.domain_vocab.length === 0 && <span className="text-gray-400 text-sm">—</span>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        Sans contexte et vocabulaire, l'IA propose du générique. Ces deux champs sont votre 20% — ils rendent les suggestions utiles pour cet élève.
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Langue</label>
        <div className="flex gap-2 mt-1">
          {[{ v: 'fr', l: 'Français' }, { v: 'nl', l: 'Néerlandais' }].map(opt => (
            <button key={opt.v} onClick={() => onChange({ ...s, lang: opt.v })}
              className={`px-4 py-2 rounded border font-semibold ${s.lang === opt.v ? 'bg-[#0a9370] text-white border-[#0a9370]' : 'border-gray-300'}`}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">
          Contexte ({s.context_note.length}/300 car.)
        </label>
        <textarea
          className="w-full border rounded-lg p-2 mt-1 text-sm resize-none h-20"
          placeholder="Ex : texte argumentatif, 3e secondaire, chapitre guerre 14-18"
          value={s.context_note}
          maxLength={300}
          onChange={e => onChange({ ...s, context_note: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Vocabulaire du chapitre</label>
        <div className="flex gap-2 mt-1">
          <input className="flex-1 border rounded-lg p-2 text-sm"
            placeholder="Ajouter un mot-clé"
            value={vocabInput}
            onChange={e => setVocabInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVocab())}
          />
          <button onClick={addVocab} className="px-4 py-2 bg-[#0a9370] text-white rounded-lg text-sm font-semibold">+</button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {s.domain_vocab.map(w => (
            <span key={w} className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded text-sm flex items-center gap-1">
              {w}
              <button onClick={() => removeVocab(w)} className="text-teal-600 hover:text-red-500">×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  )
}
