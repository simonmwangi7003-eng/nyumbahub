import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Building2, CalendarCheck, Clock, Eye, Heart, Inbox, Star, Users, Wallet } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatKsh, formatKshShort, typeLabel } from '../../lib/utils'
import { PageHeader, Spinner } from '../../components/ui'

const COLORS = ['#0b6b4a', '#c2512f', '#3f9c74', '#e0a526', '#2b6cb0', '#7c3aed', '#64748b', '#0891b2', '#be185d', '#65a30d']

const Stat = ({ icon: Icon, label, value, sub, tone = 'brand', to }) => {
  const tones = { brand: 'bg-brand-50 text-brand-600', laterite: 'bg-laterite-50 text-laterite-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600', purple: 'bg-purple-50 text-purple-600' }
  const body = (
    <div className="card flex items-center gap-4 p-4 transition hover:shadow-md">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="h-6 w-6" /></span>
      <div className="min-w-0"><p className="text-sm text-slate-500">{label}</p><p className="font-display text-2xl font-extrabold leading-tight">{value}</p>{sub && <p className="truncate text-xs text-slate-400">{sub}</p>}</div>
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

const ChartCard = ({ title, children, className = '' }) => (
  <div className={`card p-4 sm:p-5 ${className}`}><h3 className="mb-3 font-bold">{title}</h3><div className="h-64">{children}</div></div>
)

export default function AdminDashboard() {
  const [s, setS] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    supabase.rpc('admin_stats').then(({ data, error }) => (error ? setErr(error.message) : setS(data)))
  }, [])

  if (err) return <div className="card p-6 text-red-600">Could not load statistics: {err}. Make sure you ran supabase/schema.sql and your profile role is 'admin'.</div>
  if (!s) return <Spinner />
  const n = (v) => Number(v || 0).toLocaleString('en-KE')
  const status = [['Approved', s.approved], ['Pending', s.pending], ['Rejected', s.rejected], ['Sold / let', s.closed]].map(([name, value]) => ({ name, value: Number(value) }))
  const types = (s.by_type || []).map((t) => ({ ...t, name: typeLabel(t.name) }))

  return (
    <>
      <PageHeader title="Platform overview" subtitle="Live statistics across NyumbaHub Kenya." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat icon={Building2} label="Total properties" value={n(s.total_properties)} sub={`${n(s.for_sale)} for sale • ${n(s.for_rent)} to rent`} />
        <Stat icon={Clock} label="Pending approval" value={n(s.pending)} tone="amber" to="/admin/properties?status=pending" sub="Needs your review" />
        <Stat icon={Users} label="Registered users" value={n(s.total_users)} tone="blue" to="/admin/users" sub={`${n(s.agents)} agents`} />
        <Stat icon={Inbox} label="Inquiries" value={n(s.total_inquiries)} tone="purple" to="/admin/inquiries" sub={`${n(s.new_inquiries)} new`} />
        <Stat icon={CalendarCheck} label="Viewing requests" value={n(s.viewings)} tone="purple" />
        <Stat icon={Eye} label="Total views" value={n(s.total_views)} tone="laterite" />
        <Stat icon={Star} label="Featured listings" value={n(s.featured)} tone="amber" />
        <Stat icon={Heart} label="Saved properties" value={n(s.total_favorites)} tone="laterite" />
        <Stat icon={Wallet} label="Average prices" value={formatKshShort(s.avg_sale_price)} sub={`Avg rent ${formatKsh(s.avg_rent)}/mo`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Growth over the last 6 months" className="lg:col-span-2">
          <ResponsiveContainer><LineChart data={s.monthly}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Legend />
            <Line type="monotone" dataKey="listings" name="Listings" stroke="#0b6b4a" strokeWidth={2.5} /><Line type="monotone" dataKey="users" name="New users" stroke="#2b6cb0" strokeWidth={2.5} /><Line type="monotone" dataKey="inquiries" name="Inquiries" stroke="#c2512f" strokeWidth={2.5} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Listings by county (top 8)">
          <ResponsiveContainer><BarChart data={s.by_county} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis type="number" allowDecimals={false} fontSize={12} /><YAxis type="category" dataKey="name" width={80} fontSize={12} /><Tooltip /><Bar dataKey="value" name="Listings" fill="#0b6b4a" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Listings by property type">
          <ResponsiveContainer><PieChart><Pie data={types} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>{types.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Listing status">
          <ResponsiveContainer><BarChart data={status}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="value" name="Listings" radius={[6, 6, 0, 0]}>{status.map((_, i) => <Cell key={i} fill={['#0b6b4a', '#e0a526', '#dc2626', '#64748b'][i]} />)}</Bar></BarChart></ResponsiveContainer>
        </ChartCard>
        <div className="card p-4 sm:p-5">
          <h3 className="mb-3 font-bold">Most viewed properties</h3>
          {s.top_properties?.length ? (
            <ol className="divide-y divide-slate-100">
              {s.top_properties.map((p, i) => (
                <li key={p.id}><Link to={`/properties/${p.id}`} className="flex items-center gap-3 py-3 hover:text-brand-700"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.title}</span><span className="text-xs text-slate-500">{p.county}</span></span><span className="flex items-center gap-1 text-sm text-slate-500"><Eye className="h-4 w-4" />{n(p.views)}</span></Link></li>
              ))}
            </ol>
          ) : <p className="text-sm text-slate-500">No data yet.</p>}
        </div>
      </div>
    </>
  )
}
