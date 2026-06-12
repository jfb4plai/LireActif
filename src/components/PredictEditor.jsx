import { useState, useRef, useCallback } from 'react'

export default function PredictEditor({ token, settings }) {
  const s = settings ?? { background: 'white' }
  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const bgClass = s.background === 'yellow' ? 'bg-[#e8d5a3]' : 'bg-white'

  const fetchSuggestions = useCallback(async (currentText) => {
    if (!currentText.trim() || currentText.trim().split(/\s+/).length < 2) { setSuggestions([]); return }
    setLoading(true)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, token })
      })
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
    } catch { setSuggestions([]) }
    finally { setLoading(false) }
  }, [token])

  function handleChange(e) {
    const val = e.target.value
    setText(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 600)
  }

  function insertSuggestion(word) {
    const lastSpace = text.lastIndexOf(' ')
    const newText = lastSpace >= 0 ? text.slice(0, lastSpace + 1) + word + ' ' : word + ' '
    setText(newText)
    setSuggestions([])
  }

  return (
    <div className="space-y-3">
      <textarea
        className={`w-full border border-p-bord rounded-[2px] p-4 ${bgClass} resize-none h-48 focus:outline-none focus:border-p-noir`}
        style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px' }}
        placeholder="Commence à écrire…"
        value={text} onChange={handleChange}
      />
      <div className="flex gap-2 min-h-[44px]">
        {loading && <span className="text-p-gris2 text-sm self-center">…</span>}
        {!loading && suggestions.map((sg, i) => (
          <button key={i} onClick={() => insertSuggestion(sg)}
            className="flex-1 py-2 px-3 bg-p-bg border border-p-bord hover:bg-p-noir hover:text-white rounded-[2px] text-sm font-semibold transition-colors">
            {sg}
          </button>
        ))}
      </div>
    </div>
  )
}
