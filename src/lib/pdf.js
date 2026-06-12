import { jsPDF } from 'jspdf'

export function generateStudentPDF({ student, rsvp, predict, note }) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const today = new Date().toLocaleDateString('fr-BE')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor('#FF3399')
  doc.text('LireActif — Fiche élève', 20, 20)

  doc.setTextColor('#000000')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Élève : ${student.display_name}`, 20, 32)
  doc.text(`Généré le : ${today}`, 20, 39)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Réglages RSVP', 20, 52)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const rsvpLines = [
    `Vitesse : ${rsvp?.wpm ?? 180} mots/min`,
    `Taille police : ${rsvp?.font_size ?? 36}px (Arial)`,
    `Mots par affichage : ${rsvp?.chunk_size ?? 1}`,
    `Pause ponctuation : ${rsvp?.pause_punctuation ? 'Oui' : 'Non'}`,
    `Fond : ${rsvp?.background === 'yellow' ? 'Jaune doux' : 'Blanc'}`,
  ]
  rsvpLines.forEach((line, i) => doc.text(line, 25, 62 + i * 7))

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Réglages Prédiction', 20, 105)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Langue : ${predict?.lang === 'nl' ? 'Néerlandais' : 'Français'}`, 25, 115)

  const context = predict?.context_note || '—'
  const contextLines = doc.splitTextToSize(`Contexte : ${context}`, 160)
  doc.text(contextLines, 25, 122)

  const vocab = predict?.domain_vocab?.join(', ') || '—'
  const vocabLines = doc.splitTextToSize(`Vocabulaire : ${vocab}`, 160)
  doc.text(vocabLines, 25, 122 + contextLines.length * 6 + 4)

  const noteY = 165
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Note libre (enseignant)', 20, noteY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  if (note?.trim()) {
    const noteLines = doc.splitTextToSize(note, 160)
    doc.text(noteLines, 25, noteY + 8)
  } else {
    doc.setTextColor('#999999')
    doc.text('—', 25, noteY + 8)
  }

  doc.setTextColor('#999999')
  doc.setFontSize(9)
  doc.text('LireActif — PLAI Liège — lire.jfb4plai.com', 20, 285)

  doc.save(`lireactif-${student.display_name.replace(/\s/g, '-')}-${today}.pdf`)
}
