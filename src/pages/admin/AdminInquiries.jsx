import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Calendar, Phone, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatDate, statusStyles, timeAgo, waLink } from '../../lib/utils'
import { EmptyState, PageHeader, Spinner } from '../../components/ui'

export default function AdminInquiries() {
  const [items, setItems] = useState(null)
  const [filter, setFilter] = useState('all')
  const load = useCallback(() => supabase.from('inquiries').select('*, properties(id,title,county)').order('created_at', { ascending: false }).limit(300).then(({ data }) => setItems(data || [])), [])
  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => { const { error } = await supabase.from('inquiries').update({ status }).eq('id', id); error ? toast.error(error.message) : load() }
  const remove = async (id) => { if (!window.confirm('Delete this inquiry?')) return; const { error } = await supabase.from('inquiries').delete().eq('id', id); error ? toast.error(error.message) : (toast.success('Deleted'), load()) }
  const shown = (items || []).filter((i) => filter === 'all' || i.status === filter || i.kind === filter)

  return (
    <>
      <PageHeader title="All inquiries" subtitle="Messages and viewing requests across the platform." />
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-slate-200 p-1 text-sm font-semibold w-fit max-w-full">
        {[['all', 'All'], ['new', 'New'], ['contacted', 'Contacted'], ['closed', 'Closed'], ['viewing', 'Viewings']].map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={`whitespace-nowrap rounded-md px-3 py-1.5 ${filter === k ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}>{l}</button>)}
      </div>
      {!items ? <Spinner /> : !shown.length ? <EmptyState title="No inquiries" text="Nothing matches this filter yet." /> : (
        <div className="space-y-3">
          {shown.map((i) => (
            <div key={i.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className={`badge ${i.kind === 'viewing' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>{i.kind === 'viewing' ? 'Viewing' : 'Message'}</span><span className={`badge capitalize ${statusStyles[i.status]}`}>{i.status}</span><span className="text-xs text-slate-400">{timeAgo(i.created_at)}</span></div>
                  <p className="mt-1 font-bold">{i.name} <span className="font-normal text-slate-500">&bull; {i.phone}{i.email && ` • ${i.email}`}</span></p>
                  <Link to={`/properties/${i.properties?.id}`} className="text-sm text-brand-700 hover:underline">{i.properties?.title}{i.properties?.county && `, ${i.properties.county}`}</Link>
                </div>
                <div className="flex gap-1">
                  <a href={`tel:${i.phone}`} className="btn-outline px-3 py-1.5" aria-label="Call"><Phone className="h-4 w-4" /></a>
                  <a href={waLink(i.phone, `Hi ${i.name}, regarding "${i.properties?.title}" on NyumbaHub.`)} target="_blank" rel="noreferrer" className="btn-outline py-1.5">WhatsApp</a>
                  <button onClick={() => remove(i.id)} className="btn-outline px-3 py-1.5 text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {i.preferred_date && <p className="mt-2 flex items-center gap-1.5 text-sm text-purple-700"><Calendar className="h-4 w-4" />{formatDate(i.preferred_date)}</p>}
              {i.message && <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{i.message}</p>}
              <div className="mt-3 flex gap-2 text-sm">{['new', 'contacted', 'closed'].filter((s) => s !== i.status).map((s) => <button key={s} onClick={() => setStatus(i.id, s)} className="btn-ghost py-1 capitalize">Mark {s}</button>)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
