import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Non autorisé' })

  const jwt = authHeader.slice(7)
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
  if (authError || !user) return res.status(401).json({ error: 'Token JWT invalide' })

  const { student_id } = req.body
  if (!student_id) return res.status(400).json({ error: 'student_id requis' })

  const { data: student } = await supabase
    .from('student_profiles')
    .select('id, owner_id')
    .eq('id', student_id)
    .maybeSingle()

  if (!student || student.owner_id !== user.id) {
    return res.status(403).json({ error: 'Non autorisé — vous n\'êtes pas propriétaire de ce profil' })
  }

  const token = crypto.randomBytes(24).toString('base64url')
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error: insertError } = await supabase
    .from('student_tokens')
    .insert({ student_id, token, expires_at, created_by: user.id })

  if (insertError) return res.status(500).json({ error: 'Erreur création token' })

  const appUrl = process.env.APP_URL ?? 'https://lire.jfb4plai.com'
  return res.status(200).json({ token, url: `${appUrl}/eleve/${token}`, expires_at })
}
