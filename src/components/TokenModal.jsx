import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../supabase.js'

export default function TokenModal({ studentId, onClose }) {
  const [url, setUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/generate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ student_id: studentId })
    })
    const data = await res.json()
    if (data.url) { setUrl(data.url); setExpiresAt(new Date(data.expires_at).toLocaleDateString('fr-BE')) }
    setLoading(false)
  }

  function copyUrl() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-p-bord rounded-[2px] max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-p-noir">Accès élève</h2>
          <button onClick={onClose} className="text-p-gris2 hover:text-p-noir text-xl leading-none">×</button>
        </div>

        {!url ? (
          <button onClick={generate} disabled={loading}
            className="w-full bg-p-noir text-white py-2.5 rounded-[2px] font-semibold text-sm disabled:opacity-50 hover:bg-p-noir2 transition-colors">
            {loading ? 'Génération…' : 'Générer un accès (30 jours)'}
          </button>
        ) : (
          <>
            <div className="flex justify-center p-4 bg-p-bg border border-p-bord rounded-[2px]">
              <QRCodeSVG value={url} size={180} />
            </div>
            <div className="bg-p-bg border border-p-bord rounded-[2px] p-3 text-xs break-all text-p-gris">{url}</div>
            <button onClick={copyUrl}
              className="w-full border border-p-noir text-p-noir py-2 rounded-[2px] text-sm font-semibold hover:bg-p-noir hover:text-white transition-colors">
              {copied ? '✓ Copié !' : 'Copier le lien'}
            </button>
            <p className="text-xs text-p-gris2 text-center">Expire le {expiresAt}</p>
            <button onClick={generate} className="w-full text-xs text-p-gris2 hover:text-p-rose transition-colors">
              Générer un nouveau lien
            </button>
          </>
        )}
      </div>
    </div>
  )
}
