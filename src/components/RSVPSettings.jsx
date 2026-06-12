export default function RSVPSettings({ settings, onChange, readOnly = false }) {
  const s = settings ?? { wpm: 180, font_size: 36, chunk_size: 1, pause_punctuation: true, background: 'white', show_context: false }

  if (readOnly) return (
    <div className="space-y-2 text-gray-700">
      <Row label="Vitesse">{s.wpm} mots/min</Row>
      <Row label="Taille police">{s.font_size}px</Row>
      <Row label="Mots par affichage">{s.chunk_size}</Row>
      <Row label="Pause ponctuation">{s.pause_punctuation ? 'Oui' : 'Non'}</Row>
      <Row label="Fond">{s.background === 'yellow' ? 'Ocre' : 'Blanc'}</Row>
      <Row label="Mots de contexte">{s.show_context ? 'Activés' : 'Désactivés'}</Row>
    </div>
  )

  return (
    <div className="space-y-4">
      <Field label={`Vitesse : ${s.wpm} mots/min`}>
        <input type="range" min={30} max={400} step={10} value={s.wpm}
          onChange={e => onChange({ ...s, wpm: Number(e.target.value) })}
          className="w-full accent-[#0a9370]" />
      </Field>
      <Field label={`Taille police : ${s.font_size}px`}>
        <input type="range" min={24} max={72} step={2} value={s.font_size}
          onChange={e => onChange({ ...s, font_size: Number(e.target.value) })}
          className="w-full accent-[#0a9370]" />
      </Field>
      <Field label="Mots par affichage">
        <div className="flex gap-2">
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => onChange({ ...s, chunk_size: n })}
              className={`px-4 py-2 rounded border font-semibold ${s.chunk_size === n ? 'bg-[#0a9370] text-white border-[#0a9370]' : 'border-gray-300'}`}>
              {n}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Pause aux ponctuations">
        <button onClick={() => onChange({ ...s, pause_punctuation: !s.pause_punctuation })}
          className={`px-4 py-2 rounded border font-semibold ${s.pause_punctuation ? 'bg-[#0a9370] text-white border-[#0a9370]' : 'border-gray-300'}`}>
          {s.pause_punctuation ? 'Activée' : 'Désactivée'}
        </button>
      </Field>
      <Field label="Fond de lecture">
        <div className="flex gap-2">
          {[{ value: 'white', label: 'Blanc' }, { value: 'yellow', label: 'Ocre' }].map(opt => (
            <button key={opt.value} onClick={() => onChange({ ...s, background: opt.value })}
              className={`px-4 py-2 rounded border font-semibold ${s.background === opt.value ? 'bg-[#0a9370] text-white border-[#0a9370]' : 'border-gray-300'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Mots de contexte (chunks précédent / suivant)">
        <button onClick={() => onChange({ ...s, show_context: !s.show_context })}
          className={`px-4 py-2 rounded border font-semibold ${s.show_context ? 'bg-[#0a9370] text-white border-[#0a9370]' : 'border-gray-300'}`}>
          {s.show_context ? 'Activés' : 'Désactivés'}
        </button>
        {s.show_context && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            Déconseillé pour les profils DYS visuo-attentionnels : les mots adjacents créent un encombrement perceptif (crowding) qui peut aggraver les difficultés de décodage. (Godefroy & Roubot, 2020 — corpus RISS)
          </p>
        )}
      </Field>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      {children}
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
