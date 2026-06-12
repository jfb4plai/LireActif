import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function Nav() {
  const { signOut } = useAuth()
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-p-bord">
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-3">
          <img src="/plai-logo.png" alt="PLAI" className="h-8 w-auto" />
          <span className="text-xs font-semibold text-p-noir tracking-wide leading-tight hidden sm:block">
            LireActif
            <span className="block font-normal text-p-gris2 text-[10px] tracking-wider uppercase">PLAI — Liège</span>
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/mon-ecole" className="text-xs font-medium text-p-gris hover:text-p-rose transition-colors">Mon école</Link>
          <Link to="/demo" className="text-xs font-medium text-p-gris hover:text-p-rose transition-colors">Démo RSVP</Link>
          <button onClick={signOut} className="text-xs font-semibold bg-p-noir text-white px-3 py-1.5 rounded-[2px] hover:bg-p-noir2 transition-colors">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  )
}
