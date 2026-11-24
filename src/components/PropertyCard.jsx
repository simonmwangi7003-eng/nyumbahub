import { Link } from 'react-router-dom'
import { Bath, BedDouble, Heart, MapPin, Maximize } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import { FALLBACK_IMG, formatPrice, typeLabel } from '../lib/utils'

export default function PropertyCard({ property: p }) {
  const { ids, toggle } = useFavorites()
  const saved = ids.has(p.id)
  const isLand = p.property_type === 'land'
  return (
    <article className="card group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/properties/${p.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={p.images?.[0] || FALLBACK_IMG} alt={p.title} loading="lazy" onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className={`badge ${p.listing_type === 'rent' ? 'bg-laterite-500 text-white' : 'bg-brand-600 text-white'}`}>{p.listing_type === 'rent' ? 'For rent' : 'For sale'}</span>
          {p.featured && <span className="badge bg-amber-400 text-amber-950">Featured</span>}
          {p.status !== 'approved' && <span className="badge bg-slate-800 capitalize text-white">{p.status}</span>}
        </div>
      </Link>
      <button onClick={() => toggle(p.id)} aria-label={saved ? 'Remove from saved' : 'Save property'} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110">
        <Heart className={`h-5 w-5 ${saved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
      </button>
      <div className="p-4">
        <p className="font-display text-xl font-extrabold text-brand-700">{formatPrice(p)}</p>
        <Link to={`/properties/${p.id}`}><h3 className="mt-1 line-clamp-1 text-base font-bold leading-snug hover:text-brand-700">{p.title}</h3></Link>
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4 shrink-0" /><span className="line-clamp-1">{p.area}, {p.county}</span></p>
        <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
          {!isLand && p.property_type !== 'office' && p.property_type !== 'commercial' && (
            <>
              <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" />{p.bedrooms || 'Studio'}</span>
              <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{p.bathrooms}</span>
            </>
          )}
          {p.area_sqm > 0 && <span className="flex items-center gap-1.5"><Maximize className="h-4 w-4" />{Number(p.area_sqm).toLocaleString()} m²</span>}
          <span className="ml-auto text-xs font-medium text-slate-400">{typeLabel(p.property_type)}</span>
        </div>
      </div>
    </article>
  )
}
