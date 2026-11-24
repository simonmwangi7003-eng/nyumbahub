import { Link } from 'react-router-dom'
export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="NyumbaHub Kenya home">
      <img src="/favicon.svg" alt="" className="h-9 w-9" />
      <span className={`font-display text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-brand-900'}`}>
        Nyumba<span className="text-laterite-500">Hub</span>
      </span>
    </Link>
  )
}
