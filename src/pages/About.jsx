import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import { SUPPORT_EMAIL, SUPPORT_PHONE } from '../lib/utils'
export default function About() {
  return (
    <div className="container-x max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold">About NyumbaHub Kenya</h1>
      <p className="mt-4 leading-relaxed text-slate-700">NyumbaHub connects Kenyans with homes, land and commercial space. Whether you are renting your first bedsitter in Kahawa, buying a maisonette in Kiambu or investing in a plot in Nanyuki, we make it simple to search, compare and contact owners directly.</p>
      <p className="mt-3 leading-relaxed text-slate-700">Every listing is reviewed by our team before it goes live, and all prices are shown in Kenya Shillings.</p>
      <div className="card mt-8 space-y-3 p-6">
        <h2 className="text-lg font-bold">Talk to us</h2>
        <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-2 text-slate-700"><Phone className="h-4 w-4 text-brand-600" />{SUPPORT_PHONE}</a>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 text-slate-700"><Mail className="h-4 w-4 text-brand-600" />{SUPPORT_EMAIL}</a>
      </div>
      <Link to="/dashboard/new" className="btn-primary mt-6">List your property</Link>
    </div>
  )
}
