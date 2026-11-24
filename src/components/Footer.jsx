import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import Logo from './Logo'
import { SUPPORT_EMAIL, SUPPORT_PHONE } from '../lib/utils'

const counties = ['Nairobi', 'Mombasa', 'Kiambu', 'Nakuru', 'Kisumu', 'Kajiado', 'Machakos', 'Kilifi']

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-950 text-slate-300">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">Kenya's property marketplace. Find a home, an investment plot or your next office in all 47 counties.</p>
        </div>
        <div>
          <h4 className="mb-3 font-display font-bold text-white">Browse by county</h4>
          <ul className="space-y-2 text-sm">{counties.map((c) => <li key={c}><Link className="hover:text-white" to={`/properties?county=${encodeURIComponent(c)}`}>Property in {c}</Link></li>)}</ul>
        </div>
        <div>
          <h4 className="mb-3 font-display font-bold text-white">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/properties?listing_type=sale">Homes for sale</Link></li>
            <li><Link className="hover:text-white" to="/properties?listing_type=rent">Homes to rent</Link></li>
            <li><Link className="hover:text-white" to="/properties?property_type=land">Land and plots</Link></li>
            <li><Link className="hover:text-white" to="/mortgage">Mortgage calculator</Link></li>
            <li><Link className="hover:text-white" to="/dashboard/new">List your property</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display font-bold text-white">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-brand-300" /> Nairobi, Kenya</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-brand-300" /><a href={`tel:${SUPPORT_PHONE}`}>{SUPPORT_PHONE}</a></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-brand-300" /><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">&copy; {new Date().getFullYear()} NyumbaHub Kenya. All prices in Kenya Shillings (KSh).</div>
    </footer>
  )
}
