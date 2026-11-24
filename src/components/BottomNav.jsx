import { NavLink } from 'react-router-dom'
import { Heart, Home, PlusCircle, Search, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const { user } = useAuth()
  const items = [
    { to: '/', icon: Home, label: 'Home', end: true },
    { to: '/properties', icon: Search, label: 'Search' },
    { to: '/dashboard/new', icon: PlusCircle, label: 'List', big: true },
    { to: '/dashboard?tab=saved', icon: Heart, label: 'Saved' },
    { to: user ? '/dashboard' : '/login', icon: User, label: user ? 'Account' : 'Log in' },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Mobile navigation">
      <ul className="grid grid-cols-5">
        {items.map(({ to, icon: Icon, label, end, big }) => (
          <li key={label}>
            <NavLink to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${big ? 'text-laterite-600' : isActive && !to.includes('?') ? 'text-brand-700' : 'text-slate-500'}`}>
              <Icon className={big ? 'h-7 w-7' : 'h-5 w-5'} />{label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
