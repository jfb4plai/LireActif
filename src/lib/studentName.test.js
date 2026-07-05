import { describe, it, expect } from 'vitest'
import { isValidStudentName } from './studentName.js'

describe('isValidStudentName', () => {
  it('accepte le format prénom + initiale', () => {
    expect(isValidStudentName('Marie D.')).toBe(true)
    expect(isValidStudentName('Amélie V.')).toBe(true)
    expect(isValidStudentName('Jean-Marc T.')).toBe(true)
  })

  it("tolère les espaces superflus autour de la saisie", () => {
    expect(isValidStudentName('  Marie D.  ')).toBe(true)
  })

  it('refuse un nom complet', () => {
    expect(isValidStudentName('Marie Dupont')).toBe(false)
  })

  it('refuse une initiale sans point', () => {
    expect(isValidStudentName('Marie D')).toBe(false)
  })

  it('refuse un prénom seul', () => {
    expect(isValidStudentName('Marie')).toBe(false)
  })

  it('refuse une chaîne vide', () => {
    expect(isValidStudentName('')).toBe(false)
  })
})
