import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { KENYA_COUNTIES, PROPERTY_TYPES } from '../lib/utils'
import PropertyCard from '../components/PropertyCard'
import { CardSkeleton, EmptyState } from '../components/ui'

const PER_PAGE = 12
const FILTER_KEYS = ['q', 'listing_type', 'property_type', 'county', 'min_price', 'max_price', 'beds', 'baths']

export default function Listings() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState(null)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const g = (k) => params.get(k) || ''
  const page = Number(g('page') || 1)
  const sort = g('sort') || 'newest'

  const set = (k, v) => {
    const p = new URLSearchParams(params)
    v ? p.set(k, v) : p.delete(k)
    if (k !== 'page') p.delete('page')
    setParams(p, { replace: true })
  }
  const clear = () => setParams({})

  useEffect(() => {
    let cancelled = false
    setItems(null)
    let q = supabase.from('properties').select('*', { count: 'exact' }).eq('status', 'approved')
    if (g('listing_type')) q = q.eq('listing_type', g('listing_type'))
    if (g('property_type')) q = q.eq('property_type', g('property_type'))
    if (g('county')) q = q.eq('county', g('county'))
    if (g('min_price')) q = q.gte('price', Number(g('min_price')))
    if (g('max_price')) q = q.lte('price', Number(g('max_price')))
    if (g('beds')) q = q.gte('bedrooms', Number(g('beds')))
    if (g('baths')) q = q.gte('bathrooms', Number(g('baths')))
    const term = g('q').replace(/[%,()]/g, ' ').trim()
    if (term) q = q.or(`title.ilike.%${term}%,area.ilike.%${term}%,county.ilike.%${term}%,address.ilike.%${term}%`)
    const order = { newest: ['created_at', false], price_asc: ['price', true], price_desc: ['price', false], popular: ['views', false] }[sort]
    q = q.order('featured', { ascending: false }).order(order[0], { ascending: order[1] }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    q.then(({ data, count }) => { if (!cancelled) { setItems(data || []); setTotal(count || 0) } })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const pages = Math.max(Math.ceil(total / PER_PAGE), 1)
  const active = FILTER_KEYS.filter((k) => g(k)).length

  const Filters = (
    <div className="space-y-4">
      <div><label className="label">Keyword</label><input className="input" placeholder="Kilimani, Runda..." defaultValue={g('q')} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value.trim())} onBlur={(e) => set('q', e.target.value.trim())} /></div>
      <div><label className="label">Listing type</label>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
          {[['', 'All'], ['sale', 'Buy'], ['rent', 'Rent']].map(([v, l]) => <button key={l} onClick={() => set('listing_type', v)} className={`rounded-md py-1.5 ${g('listing_type') === v ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}>{l}</button>)}
        </div>
      </div>
      <div><label className="label">County</label><select className="input" value={g('county')} onChange={(e) => set('county', e.target.value)}><option value="">All counties</option>{KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div><label className="label">Property type</label><select className="input" value={g('property_type')} onChange={(e) => set('property_type', e.target.value)}><option value="">Any type</option>{PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">Min (KSh)</label><input type="number" min="0" className="input" defaultValue={g('min_price')} onBlur={(e) => set('min_price', e.target.value)} placeholder="0" /></div>
        <div><label className="label">Max (KSh)</label><input type="number" min="0" className="input" defaultValue={g('max_price')} onBlur={(e) => set('max_price', e.target.value)} placeholder="Any" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><label className="label">Bedrooms</label><select className="input" value={g('beds')} onChange={(e) => set('beds', e.target.value)}><option value="">Any</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}</select></div>
        <div><label className="label">Bathrooms</label><select className="input" value={g('baths')} onChange={(e) => set('baths', e.target.value)}><option value="">Any</option>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}</select></div>
      </div>
      {active > 0 && <button onClick={clear} className="btn-outline w-full"><X className="h-4 w-4" /> Clear all filters</button>}
    </div>
  )

  return (
    <div className="container-x py-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{g('listing_type') === 'rent' ? 'Properties to rent' : g('listing_type') === 'sale' ? 'Properties for sale' : 'All properties'}{g('county') && ` in ${g('county')}`}</h1>
          <p className="text-sm text-slate-500">{items === null ? 'Searching...' : `${total.toLocaleString()} ${total === 1 ? 'property' : 'properties'} found`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline lg:hidden" onClick={() => setShowFilters(true)}><SlidersHorizontal className="h-4 w-4" /> Filters{active > 0 && ` (${active})`}</button>
          <select className="input w-auto" value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort by">
            <option value="newest">Newest first</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="popular">Most viewed</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="card sticky top-20 hidden h-fit p-5 lg:block">{Filters}</aside>
        <div>
          {items === null ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : items.length === 0 ? (
            <EmptyState title="No properties match your search" text="Try widening your price range or removing a filter." action={{ to: '/properties', label: 'Reset search' }} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
          )}
          {pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button className="btn-outline" disabled={page <= 1} onClick={() => set('page', String(page - 1))}><ChevronLeft className="h-4 w-4" /> Prev</button>
              <span className="text-sm font-medium">Page {page} of {pages}</span>
              <button className="btn-outline" disabled={page >= pages} onClick={() => set('page', String(page + 1))}>Next <ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="slide-up absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white p-5 pb-8">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Filters</h2><button onClick={() => setShowFilters(false)} className="rounded-full p-1 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div>
            {Filters}
            <button className="btn-primary mt-5 w-full" onClick={() => setShowFilters(false)}>Show {total} results</button>
          </div>
        </div>
      )}
    </div>
  )
}
