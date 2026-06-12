export default function RSVPSettings({ settings, onChange, readOnly = false }) {
  const s = settings ?? { wpm: 180, font_size: 36, chunk_size: 1, pause_punctuation: true, background: 'white' }

  if (readOnly) return (
    <div className="space-y-2 text-gray-700">
      <Row label="Vitesse">{s.wpm} mots/min</Row>
      <Row label="Taille police">{s.font_size}px</Row>
      <Row label="Mots par affichage">{s.chunk_size}</Row>
      <Row label="Pause ponctuation">{s.pause_punctuation ? 'Oui' : 'Non'}</Row>
      <Row label="Fond">{s.background === 'yellow' ? 'Jaune doux' : 'Blanc'}</Row>
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
          {[{ value: 'white', label: 'Blanc' }, { value: 'yellow', label: 'Jaune doux' }].map(opt => (
            <button key={opt.value} onClick={() => onChange({ ...s, background: opt.value })}
              className={`px-4 py-2 rounded border font-semibold ${s.background === opt.value ? 'bg-[#0a9370] text-white border-[#0a9370]' : 'border-gray-300'}`}>
              {opt.label}
            </button>
          ))}
        </div>
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
