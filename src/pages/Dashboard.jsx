import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Calendar, CheckCircle2, Eye, Heart, Home, Inbox, Pencil, Phone, Plus, Trash2, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { FALLBACK_IMG, formatDate, formatPrice, isKenyanPhone, normalizePhone, statusStyles, timeAgo, waLink } from '../lib/utils'
import PropertyCard from '../components/PropertyCard'
import { EmptyState, PageHeader, Spinner } from '../components/ui'

const tabs = [['listings', 'My listings', Home], ['saved', 'Saved', Heart], ['inquiries', 'Inquiries', Inbox], ['profile', 'Profile', User]]

export default function Dashboard() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'listings'
  const { profile } = useAuth()
  return (
    <div className="container-x py-6 sm:py-8">
      <PageHeader title={`Hello, ${profile?.full_name?.split(' ')[0] || 'there'}`} subtitle="Manage your listings, saved homes and enquiries.">
        <Link to="/dashboard/new" className="btn-accent"><Plus className="h-4 w-4" /> List property</Link>
      </PageHeader>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {tabs.map(([k, l, Icon]) => (
          <button key={k} onClick={() => setParams({ tab: k })} className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold ${tab === k ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Icon className="h-4 w-4" />{l}</button>
        ))}
      </div>
      {tab === 'listings' && <MyListings />}
      {tab === 'saved' && <Saved />}
      {tab === 'inquiries' && <Inquiries />}
      {tab === 'profile' && <ProfileTab />}
    </div>
  )
}

function MyListings() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  const load = useCallback(() => supabase.from('properties').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setItems(data || [])), [user.id])
  useEffect(() => { load() }, [load])

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('properties').delete().eq('id', p.id)
    if (error) return toast.error(error.message)
    toast.success('Listing deleted'); load()
  }
  const close = async (p) => {
    const { error } = await supabase.from('properties').update({ status: 'closed' }).eq('id', p.id)
    error ? toast.error(error.message) : (toast.success(`Marked as ${p.listing_type === 'sale' ? 'sold' : 'let'}`), load())
  }

  if (!items) return <Spinner />
  if (!items.length) return <EmptyState icon={Home} title="You haven't listed anything yet" text="Add your first property. It goes live once our team approves it." action={{ to: '/dashboard/new', label: 'List a property' }} />
  return (
    <div className="space-y-3">
      {items.map((p) => (
        <div key={p.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <img src={p.images?.[0] || FALLBACK_IMG} alt="" className="h-40 w-full rounded-lg object-cover sm:h-24 sm:w-36" onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className={`badge capitalize ${statusStyles[p.status]}`}>{p.status === 'closed' ? (p.listing_type === 'sale' ? 'sold' : 'let') : p.status}</span>{p.featured && <span className="badge bg-amber-100 text-amber-800">Featured</span>}</div>
            <Link to={`/properties/${p.id}`} className="mt-1 block truncate font-bold hover:text-brand-700">{p.title}</Link>
            <p className="text-sm text-slate-500">{p.area}, {p.county} &bull; <b className="text-brand-700">{formatPrice(p)}</b></p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Eye className="h-3.5 w-3.5" />{p.views} views &bull; {timeAgo(p.created_at)}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/dashboard/edit/${p.id}`} className="btn-outline px-3" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
            {p.status === 'approved' && <button onClick={() => close(p)} className="btn-outline px-3" title="Mark as sold / let"><CheckCircle2 className="h-4 w-4" /></button>}
            <button onClick={() => remove(p)} className="btn-outline px-3 text-red-600 hover:border-red-500 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

function Saved() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  useEffect(() => {
    supabase.from('favorites').select('created_at, properties(*)').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => setItems((data || []).map((f) => f.properties).filter(Boolean)))
  }, [user.id])
  if (!items) return <Spinner />
  if (!items.length) return <EmptyState icon={Heart} title="No saved properties" text="Tap the heart on any listing to keep it here." action={{ to: '/properties', label: 'Browse properties' }} />
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
}

function Inquiries() {
  const { user } = useAuth()
  const [recv, setRecv] = useState(null)
  const [sent, setSent] = useState(null)
  const [view, setView] = useState('received')
  const load = useCallback(() => {
    supabase.from('inquiries').select('*, properties!inner(id,title,owner_id)').eq('properties.owner_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setRecv(data || []))
    supabase.from('inquiries').select('*, properties(id,title)').eq('sender_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setSent(data || []))
  }, [user.id])
  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => {
    const { error } = await supabase.from('inquiries').update({ status }).eq('id', id)
    error ? toast.error(error.message) : load()
  }
  const list = view === 'received' ? recv : sent
  return (
    <div>
      <div className="mb-4 inline-flex rounded-lg bg-slate-200 p-1 text-sm font-semibold">
        {[['received', `Received${recv ? ` (${recv.length})` : ''}`], ['sent', `Sent${sent ? ` (${sent.length})` : ''}`]].map(([k, l]) => <button key={k} onClick={() => setView(k)} className={`rounded-md px-4 py-1.5 ${view === k ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}>{l}</button>)}
      </div>
      {!list ? <Spinner /> : !list.length ? <EmptyState icon={Inbox} title={view === 'received' ? 'No enquiries yet' : 'You have not contacted any agents'} text={view === 'received' ? 'When someone messages you or books a viewing, it appears here.' : undefined} /> : (
        <div className="space-y-3">
          {list.map((i) => (
            <div key={i.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2"><span className={`badge ${i.kind === 'viewing' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>{i.kind === 'viewing' ? 'Viewing request' : 'Message'}</span><span className={`badge capitalize ${statusStyles[i.status]}`}>{i.status}</span></div>
                  <Link to={`/properties/${i.properties?.id}`} className="mt-1 block font-bold hover:text-brand-700">{i.properties?.title}</Link>
                  {view === 'received' && <p className="text-sm text-slate-600">{i.name} &bull; {i.phone}{i.email && ` • ${i.email}`}</p>}
                </div>
                <span className="text-xs text-slate-400">{timeAgo(i.created_at)}</span>
              </div>
              {i.preferred_date && <p className="mt-2 flex items-center gap-1.5 text-sm text-purple-700"><Calendar className="h-4 w-4" />Preferred: {formatDate(i.preferred_date)}</p>}
              {i.message && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{i.message}</p>}
              {view === 'received' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={`tel:${i.phone}`} className="btn-outline py-1.5"><Phone className="h-4 w-4" />Call</a>
                  <a href={waLink(i.phone, `Hi ${i.name}, thanks for your interest in "${i.properties?.title}".`)} target="_blank" rel="noreferrer" className="btn-outline py-1.5">WhatsApp</a>
                  {i.status !== 'contacted' && <button onClick={() => setStatus(i.id, 'contacted')} className="btn-ghost py-1.5">Mark contacted</button>}
                  {i.status !== 'closed' && <button onClick={() => setStatus(i.id, 'closed')} className="btn-ghost py-1.5">Close</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileTab() {
  const { user, profile, refreshProfile } = useAuth()
  const [f, setF] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '', agency: profile?.agency || '' })
  const [busy, setBusy] = useState(false)
  const save = async (e) => {
    e.preventDefault()
    if (!isKenyanPhone(f.phone)) return toast.error('Enter a valid Kenyan phone number')
    setBusy(true)
    const { error } = await supabase.from('profiles').update({ full_name: f.full_name.trim(), phone: normalizePhone(f.phone), agency: f.agency.trim() || null }).eq('id', user.id)
    setBusy(false)
    if (error) return toast.error(error.message)
    await refreshProfile(); toast.success('Profile updated')
  }
  return (
    <form onSubmit={save} className="card max-w-xl space-y-4 p-6">
      <div><label className="label">Email</label><input className="input bg-slate-50" value={user.email} disabled /></div>
      <div><label className="label">Full name</label><input className="input" value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} required /></div>
      <div><label className="label">Phone number</label><input className="input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="0712 345 678" required /></div>
      {profile?.role !== 'user' && <div><label className="label">Agency or company (optional)</label><input className="input" value={f.agency} onChange={(e) => setF({ ...f, agency: e.target.value })} /></div>}
      <button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save changes'}</button>
    </form>
  )
}
