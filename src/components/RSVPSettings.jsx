export default function RSVPSettings({ settings, onChange }) {
  const s = settings ?? { wpm: 180, font_size: 36, chunk_size: 1, pause_punctuation: true, background: 'white', show_context: false }

  return (
    <div className="space-y-5">

      <Field
        label={`Vitesse : ${s.wpm} mots/min`}
        help="Commencer entre 100 et 150 mpm pour les lecteurs en difficulté. La suppression des saccades oculaires en RSVP réduit la fatigue, mais une vitesse trop élevée nuit à la compréhension : les régressions (retours arrière) représentent 20 % des fixations normales et sont fonctionnelles. (Aparicio et al., 2024 — corpus RISS)"
      >
        <input type="range" min={30} max={400} step={10} value={s.wpm}
          onChange={e => onChange({ ...s, wpm: Number(e.target.value) })}
          className="w-full accent-p-rose" />
      </Field>

      <Field
        label={`Taille police : ${s.font_size}px`}
        help="Une taille plus grande réduit l'encombrement perceptif (crowding) entre lettres, particulièrement bénéfique pour les profils DYS visuo-attentionnels. Privilégier 36–48 px en début d'utilisation. (Leibnitz et al., 2015 — corpus RISS)"
      >
        <input type="range" min={24} max={72} step={2} value={s.font_size}
          onChange={e => onChange({ ...s, font_size: Number(e.target.value) })}
          className="w-full accent-p-rose" />
      </Field>

      <Field
        label="Mots par affichage"
        help="1 mot = RSVP pur, charge attentionnelle maximale par unité. 2–3 mots = groupes de sens, moins déstabilisant mais plus d'information simultanée. Pour la dyslexie phonologique, commencer à 1. Pour les profils TDAH avec mémoire de travail fragile, 2 peut aider à maintenir le fil sémantique."
      >
        <div className="flex gap-2">
          {[1, 2, 3].map(n => (
            <button key={n} onClick={() => onChange({ ...s, chunk_size: n })}
              className={`px-4 py-2 rounded border font-semibold ${s.chunk_size === n ? 'bg-p-noir text-white border-p-noir' : 'border-gray-300'}`}>
              {n}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Pause aux ponctuations"
        help="Ajoute 50 % de temps d'affichage sur les mots suivis d'une ponctuation (., ; : ! ?). Recommandé : la segmentation syntaxique est un appui pour la compréhension, notamment chez les élèves dont le traitement prosodique est déficitaire. (Harrar-Eskinazi, 2023 — corpus RISS)"
      >
        <button onClick={() => onChange({ ...s, pause_punctuation: !s.pause_punctuation })}
          className={`px-4 py-2 rounded border font-semibold ${s.pause_punctuation ? 'bg-p-noir text-white border-p-noir' : 'border-gray-300'}`}>
          {s.pause_punctuation ? 'Activée' : 'Désactivée'}
        </button>
      </Field>

      <Field
        label="Fond de lecture"
        help="Le fond ocre réduit le contraste lumineux blanc/noir, utilisé comme adaptation pour les profils sensibles à l'éblouissement ou présentant un syndrome de Meares-Irlen (photosensibilité). Effet documenté mais variable selon les individus : à tester avec l'élève. (Klein, 2010 — corpus RISS)"
      >
        <div className="flex gap-2">
          {[{ value: 'white', label: 'Blanc' }, { value: 'yellow', label: 'Ocre' }].map(opt => (
            <button key={opt.value} onClick={() => onChange({ ...s, background: opt.value })}
              className={`px-4 py-2 rounded border font-semibold ${s.background === opt.value ? 'bg-p-noir text-white border-p-noir' : 'border-gray-300'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Mots de contexte"
        help={
          <span>
            Affiche le chunk précédent et le suivant en grisé, de part et d'autre du mot central. Peut aider les lecteurs qui perdent le fil sémantique en RSVP pur.{' '}
            <strong className="text-amber-800">Déconseillé pour les profils DYS visuo-attentionnels</strong> : les mots adjacents créent un encombrement perceptif (crowding) démontré comme facteur aggravant de la dyslexie — certains élèves lisent 20 % plus vite quand l'espacement est augmenté, pas réduit. (Godefroy & Roubot, 2020 ; Leibnitz et al., 2015 — corpus RISS)
          </span>
        }
      >
        <button onClick={() => onChange({ ...s, show_context: !s.show_context })}
          className={`px-4 py-2 rounded border font-semibold ${s.show_context ? 'bg-p-noir text-white border-p-noir' : 'border-gray-300'}`}>
          {s.show_context ? 'Activés' : 'Désactivés'}
        </button>
      </Field>

    </div>
  )
}

function Field({ label, help, children }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {help && <p className="text-xs text-gray-500 leading-relaxed">{help}</p>}
      <div className="pt-1">{children}</div>
    </div>
  )
}
