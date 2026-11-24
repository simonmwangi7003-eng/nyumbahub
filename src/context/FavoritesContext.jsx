import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const Ctx = createContext({ ids: new Set(), toggle: () => {} })
export const useFavorites = () => useContext(Ctx)

export function FavoritesProvider({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [ids, setIds] = useState(new Set())

  useEffect(() => {
    if (!user) return setIds(new Set())
    supabase.from('favorites').select('property_id').eq('user_id', user.id)
      .then(({ data }) => setIds(new Set((data || []).map((f) => f.property_id))))
  }, [user])

  const toggle = useCallback(async (propertyId) => {
    if (!user) {
      toast('Log in to save properties')
      return navigate('/login', { state: { from: window.location.pathname + window.location.search } })
    }
    const has = ids.has(propertyId)
    setIds((prev) => { const n = new Set(prev); has ? n.delete(propertyId) : n.add(propertyId); return n })
    const { error } = has
      ? await supabase.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId)
      : await supabase.from('favorites').insert({ user_id: user.id, property_id: propertyId })
    if (error) {
      toast.error('Could not update saved properties')
      setIds((prev) => { const n = new Set(prev); has ? n.add(propertyId) : n.delete(propertyId); return n })
    } else toast.success(has ? 'Removed from saved' : 'Saved to your list')
  }, [user, ids, navigate])

  return <Ctx.Provider value={{ ids, toggle }}>{children}</Ctx.Provider>
}
