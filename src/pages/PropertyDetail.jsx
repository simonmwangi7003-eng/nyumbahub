import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bath, BedDouble, Calendar, Check, ChevronLeft, ChevronRight, Eye, Heart, MapPin, Maximize, MessageCircle, Phone, Send, Share2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { FALLBACK_IMG, SUPPORT_PHONE, formatPrice, isKenyanPhone, normalizePhone, timeAgo, typeLabel, waLink } from '../lib/utils'
import MortgageCalculator from '../components/MortgageCalculator'
import PropertyCard from '../components/PropertyCard'
import { Spinner } from '../components/ui'

export default function PropertyDetail() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const { ids, toggle } = useFavorites()
  const [p, setP] = useState(undefined)
  const [owner, setOwner] = useState(null)
  const [similar, setSimilar] = useState([])
  const [idx, setIdx] = useState(0)
  const [kind, setKind] = useState('inquiry')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', date: '' })

  useEffect(() => {
    setP(undefined); setIdx(0); setSent(false)
    supabase.from('properties').select('*').eq('id', id).maybeSingle().then(async ({ data }) => {
      setP(data || null)
      if (!data) return
      if (data.status === 'approved') supabase.rpc('increment_views', { pid: id })
      if (data.owner_id) supabase.from('public_profiles').select('*').eq('id', data.owner_id).maybeSingle().then(({ data: o }) => setOwner(o))
      else setOwner(null)
      supabase.from('properties').select('*').eq('status', 'approved').eq('county', data.county).neq('id', id).limit(3).then(({ data: s }) => setSimilar(s || []))
    })
  }, [id])

  useEffect(() => {
    setForm((f) => ({ ...f, name: f.name || profile?.full_name || '', email: f.email || profile?.email || '', phone: f.phone || profile?.phone || '' }))
  }, [profile])

  if (p === undefined) return <Spinner className="min-h-[60vh]" />
  if (p === null) return (
    <div className="container-x py-20 text-center"><h1 className="text-2xl font-bold">Property not found</h1><p className="mt-2 text-slate-500">It may have been removed or is awaiting approval.</p><Link to="/properties" className="btn-primary mt-5">Browse properties</Link></div>
  )

  const imgs = p.images?.length ? p.images : [FALLBACK_IMG]
  const contactPhone = owner?.phone || SUPPORT_PHONE
  const saved = ids.has(p.id)
  const isLand = p.property_type === 'land'
  const hasMap = p.latitude && p.longitude
  const mapSrc = hasMap
    ? `https://maps.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(`${p.area}, ${p.county}, Kenya`)}&z=13&output=embed`
  const msg = `Hello, I'm interested in "${p.title}" (${formatPrice(p)}) in ${p.area}, ${p.county} on NyumbaHub.`

  const share = async () => {
    const data = { title: p.title, text: msg, url: window.location.href }
    if (navigator.share) { try { await navigator.share(data) } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied') }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Enter your name')
    if (!isKenyanPhone(form.phone)) return toast.error('Enter a valid Kenyan phone number, e.g. 0712 345 678')
    if (kind === 'viewing' && !form.date) return toast.error('Choose a preferred viewing date')
    setSending(true)
    const { error } = await supabase.from('inquiries').insert({
      property_id: p.id, sender_id: user?.id ?? null, name: form.name.trim(), email: form.email.trim() || null,
      phone: normalizePhone(form.phone), message: form.message.trim() || null, kind,
      preferred_date: kind === 'viewing' ? new Date(form.date).toISOString() : null,
    })
    setSending(false)
    if (error) return toast.error('Could not send. Please try again.')
    setSent(true)
    toast.success(kind === 'viewing' ? 'Viewing request sent' : 'Message sent')
  }

  return (
    <div className="container-x py-6">
      <nav className="mb-4 text-sm text-slate-500"><Link to="/properties" className="hover:text-brand-700">Properties</Link> / <Link to={`/properties?county=${encodeURIComponent(p.county)}`} className="hover:text-brand-700">{p.county}</Link> / <span className="text-slate-700">{p.area}</span></nav>
      {p.status !== 'approved' && <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">This listing is <b className="capitalize">{p.status}</b> and only visible to you{p.status === 'pending' ? ' until an admin approves it' : ''}.</div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <div className="card overflow-hidden">
            <div className="relative aspect-[16/10] bg-slate-100">
              <img src={imgs[idx]} alt={p.title} onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} className="h-full w-full object-cover" />
              {imgs.length > 1 && (<>
                <button onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white" aria-label="Previous photo"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={() => setIdx((idx + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white" aria-label="Next photo"><ChevronRight className="h-5 w-5" /></button>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">{idx + 1} / {imgs.length}</span>
              </>)}
              <span className={`badge absolute left-3 top-3 ${p.listing_type === 'rent' ? 'bg-laterite-500 text-white' : 'bg-brand-600 text-white'}`}>{p.listing_type === 'rent' ? 'For rent' : 'For sale'}</span>
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {imgs.map((src, i) => <button key={src + i} onClick={() => setIdx(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === idx ? 'border-brand-600' : 'border-transparent opacity-70'}`}><img src={src} alt="" className="h-full w-full object-cover" /></button>)}
              </div>
            )}
          </div>

          <div className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-3xl font-extrabold text-brand-700">{formatPrice(p)}</p>
                <h1 className="mt-1 text-xl font-bold sm:text-2xl">{p.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-slate-500"><MapPin className="h-4 w-4" />{p.address ? `${p.address}, ` : ''}{p.area}, {p.county}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(p.id)} className="btn-outline"><Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />{saved ? 'Saved' : 'Save'}</button>
                <button onClick={share} className="btn-outline" aria-label="Share"><Share2 className="h-4 w-4" /><span className="hidden sm:inline">Share</span></button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {!isLand && <><Stat icon={BedDouble} label="Bedrooms" value={p.bedrooms || 'Studio'} /><Stat icon={Bath} label="Bathrooms" value={p.bathrooms} /></>}
              {p.area_sqm > 0 && <Stat icon={Maximize} label="Size" value={`${Number(p.area_sqm).toLocaleString()} m²`} />}
              <Stat icon={Eye} label="Views" value={p.views} />
            </div>
            <p className="mt-4 text-xs text-slate-400">{typeLabel(p.property_type)} &bull; Listed {timeAgo(p.created_at)}</p>
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="mb-3 text-lg font-bold">Description</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-700">{p.description || 'No description provided.'}</p>
            {p.amenities?.length > 0 && (<>
              <h2 className="mb-3 mt-6 text-lg font-bold">Features and amenities</h2>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{p.amenities.map((a) => <li key={a} className="flex items-center gap-2 text-sm text-slate-700"><Check className="h-4 w-4 text-brand-600" />{a}</li>)}</ul>
            </>)}
          </div>

          <div className="card overflow-hidden">
            <h2 className="p-5 pb-3 text-lg font-bold">Location</h2>
            <iframe title="Property location" src={mapSrc} className="h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>

          {p.listing_type === 'sale' && <MortgageCalculator defaultPrice={p.price} />}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">{(owner?.full_name || 'N')[0]}</span>
              <div><p className="font-bold">{owner?.full_name || 'NyumbaHub Team'}</p><p className="text-xs capitalize text-slate-500">{owner?.agency || owner?.role || 'Listing agent'}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${normalizePhone(contactPhone)}`} className="btn-primary"><Phone className="h-4 w-4" /> Call</a>
              <a href={waLink(contactPhone, msg)} target="_blank" rel="noreferrer" className="btn bg-[#25D366] text-white hover:bg-[#1ebe5b]"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
              <button onClick={() => { setKind('inquiry'); setSent(false) }} className={`flex items-center justify-center gap-1.5 rounded-md py-2 ${kind === 'inquiry' ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}><Send className="h-4 w-4" /> Message</button>
              <button onClick={() => { setKind('viewing'); setSent(false) }} className={`flex items-center justify-center gap-1.5 rounded-md py-2 ${kind === 'viewing' ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}><Calendar className="h-4 w-4" /> Book viewing</button>
            </div>
            {sent ? (
              <div className="rounded-lg bg-brand-50 p-5 text-center"><Check className="mx-auto mb-2 h-8 w-8 text-brand-600" /><p className="font-semibold">Request sent</p><p className="mt-1 text-sm text-slate-600">The agent will contact you on {form.phone}.</p><button onClick={() => setSent(false)} className="mt-3 text-sm font-semibold text-brand-700">Send another</button></div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className="input" placeholder="Phone e.g. 0712 345 678" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                <input className="input" type="email" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                {kind === 'viewing' && <div><label className="label">Preferred date and time</label><input type="datetime-local" className="input" min={new Date().toISOString().slice(0, 16)} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>}
                <textarea className="input min-h-[90px]" placeholder={kind === 'viewing' ? 'Anything the agent should know? (optional)' : 'I am interested in this property...'} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                <button className="btn-accent w-full" disabled={sending}>{sending ? 'Sending...' : kind === 'viewing' ? 'Request viewing' : 'Send message'}</button>
              </form>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-12"><h2 className="mb-4 text-2xl font-extrabold">More properties in {p.county}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <PropertyCard key={s.id} property={s} />)}</div></section>
      )}
    </div>
  )
}

const Stat = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3"><Icon className="h-5 w-5 text-brand-600" /><div><p className="text-xs text-slate-500">{label}</p><p className="font-bold">{value}</p></div></div>
)
