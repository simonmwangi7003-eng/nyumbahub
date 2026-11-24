import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Home as HomeIcon, Landmark, MapPin, Search, ShieldCheck, Trees, Wallet, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { KENYA_COUNTIES, PROPERTY_TYPES } from '../lib/utils'
import PropertyCard from '../components/PropertyCard'
import { CardSkeleton } from '../components/ui'

const popular = [
  ['Nairobi', 'Westlands, Kilimani, Karen'], ['Mombasa', 'Nyali, Bamburi, Tudor'], ['Kiambu', 'Runda, Ruiru, Thika'], ['Nakuru', 'Milimani, Section 58'],
  ['Kisumu', 'Milimani, Mamboleo'], ['Kajiado', 'Rongai, Kitengela, Ngong'], ['Machakos', 'Athi River, Syokimau'], ['Kilifi', 'Diani, Watamu, Malindi'],
]
const types = [
  { v: 'apartment', icon: Building2, l: 'Apartments' }, { v: 'house', icon: HomeIcon, l: 'Houses' }, { v: 'land', icon: Trees, l: 'Land and plots' },
  { v: 'villa', icon: Landmark, l: 'Villas' }, { v: 'office', icon: Briefcase, l: 'Offices' }, { v: 'commercial', icon: Wallet, l: 'Commercial' },
]

export default function Home() {
  const nav = useNavigate()
  const [mode, setMode] = useState('sale')
  const [county, setCounty] = useState('')
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [featured, setFeatured] = useState(null)
  const [latest, setLatest] = useState(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    supabase.from('properties').select('*').eq('status', 'approved').eq('featured', true).order('created_at', { ascending: false }).limit(6).then(({ data }) => setFeatured(data || []))
    supabase.from('properties').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(8).then(({ data }) => setLatest(data || []))
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'approved').then(({ count: c }) => setCount(c || 0))
  }, [])

  const search = (e) => {
    e.preventDefault()
    const p = new URLSearchParams({ listing_type: mode })
    if (county) p.set('county', county)
    if (type) p.set('property_type', type)
    if (q.trim()) p.set('q', q.trim())
    nav(`/properties?${p}`)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-brand-950">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1800&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/80 to-transparent" />
        <div className="container-x relative py-14 sm:py-20 lg:py-28">
          <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">Your next home is waiting in Kenya.</h1>
          <p className="mt-4 max-w-xl text-base text-brand-100 sm:text-lg">Browse {count > 0 ? `${count}+ ` : ''}verified homes, plots and offices for sale and rent, from Nairobi to Mombasa and every county in between.</p>

          <form onSubmit={search} className="mt-8 max-w-4xl rounded-2xl bg-white p-3 shadow-2xl sm:p-4">
            <div className="mb-3 inline-flex rounded-lg bg-slate-100 p-1">
              {[['sale', 'Buy'], ['rent', 'Rent']].map(([v, l]) => (
                <button type="button" key={v} onClick={() => setMode(v)} className={`rounded-md px-5 py-1.5 text-sm font-semibold transition ${mode === v ? 'bg-brand-600 text-white shadow' : 'text-slate-600'}`}>{l}</button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
              <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input className="input pl-9" placeholder="Area, estate or keyword" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" /></div>
              <select className="input" value={county} onChange={(e) => setCounty(e.target.value)} aria-label="County"><option value="">All counties</option>{KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}</select>
              <select className="input" value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type"><option value="">Any type</option>{PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
              <button className="btn-accent px-8"><Search className="h-4 w-4" /> Search</button>
            </div>
          </form>
        </div>
      </section>

      <section className="container-x py-12">
        <h2 className="text-2xl font-extrabold sm:text-3xl">What are you looking for?</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {types.map(({ v, icon: Icon, l }) => (
            <Link key={v} to={`/properties?property_type=${v}`} className="card flex flex-col items-center gap-2 p-5 text-center text-sm font-semibold transition hover:border-brand-600 hover:shadow-md">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon className="h-6 w-6" /></span>{l}
            </Link>
          ))}
        </div>
      </section>

      {(featured === null || featured.length > 0) && (
        <section className="container-x pb-12">
          <div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-extrabold sm:text-3xl">Featured properties</h2><Link to="/properties" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured === null ? [1, 2, 3].map((i) => <CardSkeleton key={i} />) : featured.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
        </section>
      )}

      <section className="bg-white py-12">
        <div className="container-x">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Explore popular counties</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {popular.map(([c, areas]) => (
              <Link key={c} to={`/properties?county=${encodeURIComponent(c)}`} className="group rounded-xl bg-brand-900 p-5 text-white transition hover:bg-brand-700">
                <MapPin className="mb-6 h-5 w-5 text-brand-300" />
                <p className="font-display text-xl font-bold">{c}</p>
                <p className="mt-1 text-xs text-brand-200">{areas}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-12">
        <div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-extrabold sm:text-3xl">Latest listings</h2><Link to="/properties" className="text-sm font-semibold text-brand-700 hover:underline">See more</Link></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{latest === null ? [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />) : latest.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
        {latest?.length === 0 && <p className="card p-8 text-center text-slate-500">No listings yet. Be the first to <Link to="/dashboard/new" className="font-semibold text-brand-700">list a property</Link>.</p>}
      </section>

      <section className="container-x pb-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[[ShieldCheck, 'Every listing is reviewed', 'Our team approves each property before it goes live, so you see real homes from real owners and agents.'],
            [Wallet, 'Prices in Kenya Shillings', 'No currency guesswork. Compare rent and sale prices in KSh and estimate your mortgage in seconds.'],
            [MapPin, 'All 47 counties covered', 'From city apartments in Nairobi to beachfront plots in Kilifi, search where you want to live or invest.']].map(([Icon, t, d]) => (
            <div key={t} className="card p-6"><Icon className="mb-3 h-7 w-7 text-brand-600" /><h3 className="text-lg font-bold">{t}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{d}</p></div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-laterite-500 p-8 text-white sm:flex-row sm:items-center">
          <div><h2 className="text-2xl font-extrabold">Own or manage property?</h2><p className="mt-1 text-laterite-100">List it free and reach thousands of Kenyan buyers and tenants.</p></div>
          <Link to="/dashboard/new" className="btn bg-white text-laterite-700 hover:bg-laterite-50">List your property</Link>
        </div>
      </section>
    </>
  )
}
