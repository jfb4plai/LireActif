import { useState, useRef, useCallback } from 'react'

export default function PredictEditor({ token, settings }) {
  const s = settings ?? { background: 'white' }
  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const bgClass = s.background === 'yellow' ? 'bg-yellow-50' : 'bg-white'

  const fetchSuggestions = useCallback(async (currentText) => {
    if (!currentText.trim() || currentText.trim().split(/\s+/).length < 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentText, token })
      })
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
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
        className={`w-full border rounded-lg p-4 ${bgClass} text-xl resize-none h-48`}
        style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px' }}
        placeholder="Commence à écrire…"
        value={text}
        onChange={handleChange}
      />
      <div className="flex gap-2 min-h-[44px]">
        {loading && <span className="text-gray-400 text-sm self-center">…</span>}
        {!loading && suggestions.map((sg, i) => (
          <button key={i} onClick={() => insertSuggestion(sg)}
            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-[#0a9370] hover:text-white rounded-lg text-base font-semibold transition-colors">
            {sg}
          </button>
        ))}
      </div>
    </div>
  )
}
