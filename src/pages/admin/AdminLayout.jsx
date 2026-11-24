import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, Building2, Inbox, Users } from 'lucide-react'

const items = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
]

export default function AdminLayout() {
  return (
    <div className="container-x py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 hidden px-3 font-display text-sm font-bold text-slate-500 lg:block">Admin panel</p>
          <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 lg:flex-col lg:p-2">
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold lg:flex-none lg:justify-start ${isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="h-4 w-4" />{label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  )
}
