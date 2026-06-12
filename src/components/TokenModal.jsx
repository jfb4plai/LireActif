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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ student_id: studentId })
    })
    const data = await res.json()
    if (data.url) {
      setUrl(data.url)
      setExpiresAt(new Date(data.expires_at).toLocaleDateString('fr-BE'))
    }
    setLoading(false)
  }

  function copyUrl() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Accès élève</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        {!url ? (
          <button onClick={generate} disabled={loading}
            className="w-full bg-[#0a9370] text-white py-3 rounded-lg font-semibold disabled:opacity-50">
            {loading ? 'Génération…' : 'Générer un accès (30 jours)'}
          </button>
        ) : (
          <>
            <div className="flex justify-center">
              <QRCodeSVG value={url} size={200} />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-xs break-all text-gray-600">{url}</div>
            <button onClick={copyUrl}
              className="w-full border border-[#0a9370] text-[#0a9370] py-2 rounded-lg font-semibold">
              {copied ? '✓ Copié !' : 'Copier le lien'}
            </button>
            <p className="text-xs text-gray-400 text-center">Expire le {expiresAt}</p>
            <button onClick={generate} className="w-full text-sm text-gray-400 underline">
              Générer un nouveau lien
            </button>
          </>
        )}
      </div>
    </div>
  )
}
