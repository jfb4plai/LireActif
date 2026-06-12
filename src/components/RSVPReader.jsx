import { useState, useEffect, useRef, useCallback } from 'react'
import { textToChunks, chunkDuration } from '../lib/rsvp.js'

export default function RSVPReader({ settings }) {
  const s = settings ?? { wpm: 180, font_size: 36, chunk_size: 1, pause_punctuation: true, background: 'white' }
  const [text, setText] = useState('')
  const [reading, setReading] = useState(false)
  const [chunks, setChunks] = useState([])
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  const bgClass = s.background === 'yellow' ? 'bg-yellow-50' : 'bg-white'

  const stop = useCallback(() => {
    clearTimeout(timerRef.current)
    setReading(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setIndex(0)
  }, [stop])

  useEffect(() => {
    if (!reading || index >= chunks.length) {
      if (index >= chunks.length && chunks.length > 0) stop()
      return
    }
    const duration = chunkDuration(chunks[index], s.wpm, s.pause_punctuation)
    timerRef.current = setTimeout(() => setIndex(i => i + 1), duration)
    return () => clearTimeout(timerRef.current)
  }, [reading, index, chunks, s.wpm, s.pause_punctuation, stop])

  function startReading() {
    const c = textToChunks(text, s.chunk_size)
    if (!c.length) return
    setChunks(c)
    setIndex(0)
    setReading(true)
  }

  const progress = chunks.length > 0 ? (index / chunks.length) * 100 : 0

  if (reading) return (
    <div className={`fixed inset-0 ${bgClass} flex flex-col items-center justify-center z-50`}>
      <div className="flex-1 flex items-center justify-center px-8">
        <span style={{ fontSize: `${s.font_size}px`, fontFamily: 'Arial, sans-serif', fontWeight: 'bold', textAlign: 'center' }}>
          {chunks[index] ?? ''}
        </span>
      </div>
      <div className="w-full bg-gray-200 h-1">
        <div className="bg-[#0a9370] h-1 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex gap-4 p-6">
        <button onClick={reset} className="px-6 py-3 bg-gray-200 rounded-lg text-lg font-semibold">⏮</button>
        <button onClick={stop} className="px-6 py-3 bg-gray-200 rounded-lg text-lg font-semibold">Pause</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <textarea
        className="w-full border rounded-lg p-3 h-40 resize-none text-base"
        placeholder="Collez ici le texte à lire…"
        value={text}
        onChange={e => { setText(e.target.value); setChunks([]); setIndex(0) }}
      />
      <button onClick={startReading} disabled={!text.trim()}
        className="w-full bg-[#0a9370] text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-40">
        Lire
      </button>
    </div>
  )
}
