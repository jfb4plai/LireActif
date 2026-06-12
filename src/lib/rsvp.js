export function textToChunks(text, chunkSize = 1) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chunks = []
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '))
  }
  return chunks
}

export function chunkDuration(chunk, wpm, pausePunctuation) {
  const wordCount = chunk.split(/\s+/).filter(Boolean).length
  const base = (wordCount / wpm) * 60 * 1000
  const hasPunctuation = /[.,;:!?]/.test(chunk)
  return pausePunctuation && hasPunctuation ? base * 1.5 : base
}
