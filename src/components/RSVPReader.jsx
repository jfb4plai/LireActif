import { useState, useEffect, useRef, useCallback } from 'react'
import { textToChunks, chunkDuration } from '../lib/rsvp.js'
import * as pdfjsLib from 'pdfjs-dist'
import mammoth from 'mammoth'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

export default function RSVPReader({ settings, defaultText = '' }) {
  const s = settings ?? { wpm: 180, font_size: 36, chunk_size: 1, pause_punctuation: true, background: 'white' }
  const [text, setText] = useState(defaultText)
  const [reading, setReading] = useState(false)
  const [chunks, setChunks] = useState([])
  const [index, setIndex] = useState(0)
  const [importing, setImporting] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('')
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)

  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window
  const bgClass = s.background === 'yellow' ? 'bg-yellow-50' : 'bg-white'

  useEffect(() => {
    if (!hasTTS) return
    function loadVoices() {
      const v = window.speechSynthesis.getVoices()
      if (!v.length) return
      setVoices(v)
      setSelectedVoiceURI(prev => {
        if (prev) return prev
        const fr = v.find(x => x.lang.startsWith('fr')) || v[0]
        return fr.voiceURI
      })
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [hasTTS])

  const stop = useCallback(() => {
    clearTimeout(timerRef.current)
    setReading(false)
    if (hasTTS) window.speechSynthesis.cancel()
  }, [hasTTS])

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
  }, [reading, index, chunks, s.wpm, s.pause_punctuation, ttsEnabled, hasTTS, selectedVoiceURI, voices, stop])

  function startReading() {
    const c = textToChunks(text, s.chunk_size)
    if (!c.length) return
    if (ttsEnabled && hasTTS) {
      window.speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(text)
      const voice = voices.find(v => v.voiceURI === selectedVoiceURI)
      if (voice) utt.voice = voice
      utt.rate = Math.min(Math.max(s.wpm / 150, 0.5), 2)
      window.speechSynthesis.speak(utt)
    }
    setChunks(c)
    setIndex(0)
    setReading(true)
  }

  async function handleFileImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const arrayBuffer = await file.arrayBuffer()
      if (ext === 'pdf') {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          fullText += content.items.map(item => item.str).join(' ') + '\n'
        }
        setText(fullText.trim())
      } else if (ext === 'docx' || ext === 'doc') {
        const result = await mammoth.extractRawText({ arrayBuffer })
        setText(result.value.trim())
      }
    } catch (err) {
      console.error('Import error:', err)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
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
      <div className="relative">
        <textarea
          className="w-full border rounded-lg p-3 h-40 resize-none text-base"
          placeholder="Collez ici le texte à lire…"
          value={text}
          onChange={e => { setText(e.target.value); setChunks([]); setIndex(0) }}
        />
        <div className="absolute bottom-2 right-2">
          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFileImport} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="text-xs bg-white hover:bg-gray-50 text-gray-500 px-3 py-1.5 rounded border disabled:opacity-50"
          >
            {importing ? 'Import…' : 'PDF / DOCX'}
          </button>
        </div>
      </div>

      {hasTTS && (
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Voix (TTS)</span>
            <button
              onClick={() => setTtsEnabled(v => !v)}
              className={`px-3 py-1 rounded text-sm font-semibold border transition-colors ${ttsEnabled ? 'bg-[#0a9370] text-white border-[#0a9370]' : 'border-gray-300 text-gray-500'}`}
            >
              {ttsEnabled ? 'Activée' : 'Désactivée'}
            </button>
          </div>
          {ttsEnabled && voices.length > 0 && (
            <select
              value={selectedVoiceURI}
              onChange={e => setSelectedVoiceURI(e.target.value)}
              className="w-full border rounded p-2 text-sm"
            >
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <button
        onClick={startReading}
        disabled={!text.trim()}
        className="w-full bg-[#0a9370] text-white py-3 rounded-lg text-lg font-semibold disabled:opacity-40"
      >
        Lire
      </button>
    </div>
  )
}
