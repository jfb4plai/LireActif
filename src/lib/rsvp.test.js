import { describe, it, expect } from 'vitest'
import { textToChunks, chunkDuration } from './rsvp.js'

describe('textToChunks', () => {
  it('découpe un texte en mots individuels par défaut', () => {
    expect(textToChunks('Le chat dort', 1)).toEqual(['Le', 'chat', 'dort'])
  })

  it('regroupe les mots par chunk_size', () => {
    expect(textToChunks('Le chat dort bien', 2)).toEqual(['Le chat', 'dort bien'])
  })

  it('gère le dernier chunk incomplet', () => {
    expect(textToChunks('un deux trois', 2)).toEqual(['un deux', 'trois'])
  })

  it('ignore les espaces multiples', () => {
    expect(textToChunks('  bonjour   monde  ', 1)).toEqual(['bonjour', 'monde'])
  })

  it('retourne un tableau vide pour un texte vide', () => {
    expect(textToChunks('', 1)).toEqual([])
  })
})

describe('chunkDuration', () => {
  it('calcule la durée en ms pour 1 mot à 180 wpm', () => {
    // 1 mot / 180 wpm * 60000 ms = 333.33 ms
    expect(chunkDuration('bonjour', 180, false)).toBeCloseTo(333.33, 0)
  })

  it('multiplie par 1.5 si pause ponctuation et ponctuation présente', () => {
    const base = chunkDuration('bonjour', 180, false)
    expect(chunkDuration('bonjour.', 180, true)).toBeCloseTo(base * 1.5, 0)
  })

  it('ne multiplie pas si pause_punctuation est false', () => {
    const base = chunkDuration('bonjour', 180, false)
    expect(chunkDuration('bonjour.', 180, false)).toBeCloseTo(base, 0)
  })

  it('calcule correctement pour un chunk de 2 mots', () => {
    // 2 mots / 180 wpm * 60000 = 666.67 ms
    expect(chunkDuration('le chat', 180, false)).toBeCloseTo(666.67, 0)
  })
})
