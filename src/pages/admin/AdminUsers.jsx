import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Ban, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../lib/utils'
import { PageHeader, Spinner } from '../../components/ui'

export default function AdminUsers() {
  const { user } = useAuth()
  const [items, setItems] = useState(null)
  const [q, setQ] = useState('')
  const load = useCallback(() => supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(500).then(({ data }) => setItems(data || [])), [])
  useEffect(() => { load() }, [load])

  const update = async (id, patch, msg) => {
    const { error } = await supabase.from('profiles').update(patch).eq('id', id)
    error ? toast.error(error.message) : (toast.success(msg), load())
  }
  const shown = (items || []).filter((u) => !q || `${u.full_name} ${u.email} ${u.phone}`.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <PageHeader title="Manage users" subtitle={items ? `${items.length} registered accounts` : ''} />
      <input className="input mb-4 max-w-xs" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
      {!items ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">User</th><th className="p-3">Phone</th><th className="p-3">Role</th><th className="p-3">Joined</th><th className="p-3 text-right">Account</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((u) => (
                <tr key={u.id} className={u.is_active ? '' : 'bg-red-50/50'}>
                  <td className="p-3"><p className="font-semibold">{u.full_name || 'No name'}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                  <td className="p-3 text-slate-600">{u.phone || '-'}</td>
                  <td className="p-3"><select className="input w-auto py-1.5" value={u.role} disabled={u.id === user.id} onChange={(e) => update(u.id, { role: e.target.value }, 'Role updated')}><option value="user">User</option><option value="agent">Agent</option><option value="admin">Admin</option></select></td>
                  <td className="whitespace-nowrap p-3 text-slate-500">{formatDate(u.created_at)}</td>
                  <td className="p-3 text-right">
                    {u.id === user.id ? <span className="text-xs text-slate-400">You</span> : u.is_active
                      ? <button onClick={() => window.confirm(`Suspend ${u.full_name || u.email}?`) && update(u.id, { is_active: false }, 'User suspended')} className="btn-outline py-1.5 text-red-600 hover:border-red-500 hover:text-red-600"><Ban className="h-4 w-4" />Suspend</button>
                      : <button onClick={() => update(u.id, { is_active: true }, 'User reactivated')} className="btn-outline py-1.5"><CheckCircle2 className="h-4 w-4" />Reactivate</button>}
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan="5" className="p-10 text-center text-slate-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
