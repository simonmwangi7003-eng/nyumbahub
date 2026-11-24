import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Plus, Shield, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const links = [
  { to: '/properties?listing_type=sale', label: 'Buy' },
  { to: '/properties?listing_type=rent', label: 'Rent' },
  { to: '/properties', label: 'All properties' },
  { to: '/mortgage', label: 'Mortgage calculator' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const loc = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setOpen(false); setMenu(false) }, [loc.pathname, loc.search])

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Account'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard/new" className="btn-accent hidden sm:inline-flex"><Plus className="h-4 w-4" /> List property</Link>
          {user ? (
            <div className="relative">
              <button onClick={() => setMenu(!menu)} className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-2 hover:bg-slate-50" aria-haspopup="menu" aria-expanded={menu}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{name[0]?.toUpperCase()}</span>
                <span className="hidden max-w-[110px] truncate text-sm font-medium sm:block">{name}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
              {menu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl" role="menu">
                    <div className="border-b border-slate-100 px-4 py-2.5"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-xs capitalize text-slate-500">{profile?.role || 'user'}</p></div>
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>
                    <Link to="/dashboard?tab=saved" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"><Heart className="h-4 w-4" /> Saved properties</Link>
                    {isAdmin && <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"><Shield className="h-4 w-4" /> Admin panel</Link>}
                    <button onClick={async () => { await signOut(); navigate('/') }} className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Log out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </>
          )}
          <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="slide-up border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
          {links.map((l) => <Link key={l.label} to={l.to} className="block rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-brand-50">{l.label}</Link>)}
          {!user && <Link to="/login" className="block rounded-lg px-3 py-3 font-medium text-slate-700 hover:bg-brand-50">Log in</Link>}
          <Link to="/dashboard/new" className="btn-accent mt-2 w-full"><Plus className="h-4 w-4" /> List your property</Link>
        </nav>
      )}
    </header>
  )
}
