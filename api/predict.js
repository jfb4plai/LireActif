import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { text, token } = req.body
  if (!text || typeof text !== 'string' || !token) {
    return res.status(400).json({ error: 'text et token requis' })
  }

  // Validate student token
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data: tokenRow } = await supabase
    .from('student_tokens')
    .select('student_id, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (!tokenRow || new Date(tokenRow.expires_at) < new Date()) {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }

  // Load student predict settings
  const { data: ps } = await supabase
    .from('predict_settings')
    .select('domain_vocab, context_note, lang')
    .eq('student_id', tokenRow.student_id)
    .maybeSingle()

  const vocab = ps?.domain_vocab ?? []
  const context = ps?.context_note ?? ''
  const lang = ps?.lang ?? 'fr'

  const vocabLine = vocab.length > 0 ? `Vocabulaire du chapitre : ${vocab.join(', ')}.` : ''
  const contextLine = context ? `Contexte : ${context}.` : ''
  const langLabel = lang === 'nl' ? 'néerlandais' : 'français'

  const prompt = `Tu es un assistant de prédiction de mots pour un élève en difficulté d'écriture.
${vocabLine}
${contextLine}
Langue : ${langLabel}.
L'élève a écrit : "${text.slice(-200)}"
Propose exactement 3 mots ou courtes expressions (2 mots max) qui pourraient suivre. Réponds UNIQUEMENT avec un tableau JSON sans markdown. Exemple : ["mot1","mot2","mot3"]`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{ role: 'user', content: prompt }]
    })
    const raw = message.content[0].text.trim()
    const suggestions = JSON.parse(raw)
    if (!Array.isArray(suggestions) || suggestions.length < 1) throw new Error('format')
    return res.status(200).json({ suggestions: suggestions.slice(0, 3) })
  } catch {
    return res.status(500).json({ error: 'Erreur prédiction' })
  }
}
