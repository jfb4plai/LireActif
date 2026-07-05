// Format imposé : "Prénom I." — prénom (accents/traits d'union autorisés) + initiale du nom + point.
// Empêche la saisie de noms complets dans un champ partagé entre enseignants (RGPD, minimisation).
const NAME_PATTERN = /^[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'-]*(?:-[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ'-]*)*\s[A-ZÀ-ÖØ-Þ]\.$/

export function isValidStudentName(name) {
  return NAME_PATTERN.test(name.trim())
}
