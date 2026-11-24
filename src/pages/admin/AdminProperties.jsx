import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Check, ExternalLink, Pencil, Star, Trash2, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { FALLBACK_IMG, formatPrice, statusStyles } from '../../lib/utils'
import { PageHeader, Spinner } from '../../components/ui'

export default function AdminProperties() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') || 'all'
  const [q, setQ] = useState('')
  const [items, setItems] = useState(null)

  const load = useCallback(() => {
    let query = supabase.from('properties').select('*, profiles:owner_id(full_name)').order('created_at', { ascending: false }).limit(200)
    if (status !== 'all') query = query.eq('status', status)
    query.then(({ data, error }) => { if (error) toast.error(error.message); setItems(data || []) })
  }, [status])
  useEffect(() => { setItems(null); load() }, [load])

  const update = async (id, patch, msg) => {
    const { error } = await supabase.from('properties').update(patch).eq('id', id)
    error ? toast.error(error.message) : (toast.success(msg), load())
  }
  const remove = async (p) => {
    if (!window.confirm(`Permanently delete "${p.title}"?`)) return
    const { error } = await supabase.from('properties').delete().eq('id', p.id)
    error ? toast.error(error.message) : (toast.success('Deleted'), load())
  }

  const shown = (items || []).filter((p) => !q || `${p.title} ${p.county} ${p.area}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHeader title="Manage properties" subtitle="Approve, reject, feature or remove listings." />
      <div className="mb-4 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search title, county, area" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-200 p-1 text-sm font-semibold">
          {['all', 'pending', 'approved', 'rejected', 'closed'].map((s) => <button key={s} onClick={() => setParams(s === 'all' ? {} : { status: s })} className={`rounded-md px-3 py-1.5 capitalize ${status === s ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}>{s}</button>)}
        </div>
      </div>
      {!items ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Property</th><th className="p-3">Price</th><th className="p-3">Owner</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3"><div className="flex items-center gap-3"><img src={p.images?.[0] || FALLBACK_IMG} alt="" className="h-12 w-16 rounded-md object-cover" onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} /><div className="min-w-0"><p className="max-w-[260px] truncate font-semibold">{p.title}</p><p className="text-xs text-slate-500">{p.area}, {p.county}</p></div></div></td>
                  <td className="whitespace-nowrap p-3 font-semibold text-brand-700">{formatPrice(p)}</td>
                  <td className="p-3 text-slate-600">{p.profiles?.full_name || 'Platform'}</td>
                  <td className="p-3"><span className={`badge capitalize ${statusStyles[p.status]}`}>{p.status}</span></td>
                  <td className="p-3"><div className="flex justify-end gap-1">
                    {p.status !== 'approved' && <button onClick={() => update(p.id, { status: 'approved' }, 'Approved')} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50" title="Approve"><Check className="h-4 w-4" /></button>}
                    {p.status !== 'rejected' && <button onClick={() => update(p.id, { status: 'rejected' }, 'Rejected')} className="rounded-lg p-2 text-amber-600 hover:bg-amber-50" title="Reject"><X className="h-4 w-4" /></button>}
                    <button onClick={() => update(p.id, { featured: !p.featured }, p.featured ? 'Unfeatured' : 'Featured')} className={`rounded-lg p-2 hover:bg-amber-50 ${p.featured ? 'text-amber-500' : 'text-slate-400'}`} title="Toggle featured"><Star className={`h-4 w-4 ${p.featured ? 'fill-amber-400' : ''}`} /></button>
                    <Link to={`/properties/${p.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="View"><ExternalLink className="h-4 w-4" /></Link>
                    <Link to={`/dashboard/edit/${p.id}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></Link>
                    <button onClick={() => remove(p)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan="5" className="p-10 text-center text-slate-500">No properties found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
