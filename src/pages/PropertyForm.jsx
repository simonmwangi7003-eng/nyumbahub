import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ImagePlus, Loader2, LocateFixed, Star, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { AMENITIES, KENYA_COUNTIES, PROPERTY_TYPES } from '../lib/utils'
import { PageHeader, Spinner } from '../components/ui'

const empty = { title: '', description: '', listing_type: 'sale', property_type: 'apartment', price: '', bedrooms: 0, bathrooms: 0, area_sqm: '', county: 'Nairobi', area: '', address: '', latitude: '', longitude: '' }

export default function PropertyForm() {
  const { id } = useParams()
  const edit = Boolean(id)
  const { user, isAdmin } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState(empty)
  const [amenities, setAmenities] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(edit)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!edit) return
    supabase.from('properties').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (!data || (data.owner_id !== user.id && !isAdmin)) { toast.error('Listing not found'); return nav('/dashboard') }
      setF({ ...empty, ...data, area_sqm: data.area_sqm ?? '', address: data.address ?? '', latitude: data.latitude ?? '', longitude: data.longitude ?? '', description: data.description ?? '' })
      setAmenities(data.amenities || []); setImages(data.images || []); setLoading(false)
    })
  }, [id, edit, user.id, isAdmin, nav])

  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const noRooms = ['land', 'commercial', 'office'].includes(f.property_type)

  const upload = async (e) => {
    const files = [...e.target.files]
    if (images.length + files.length > 10) return toast.error('You can add up to 10 photos')
    setUploading(true)
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); continue }
        if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} is larger than 5MB`); continue }
        const ext = file.name.split('.').pop().toLowerCase()
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from('property-images').upload(path, file, { cacheControl: '31536000' })
        if (error) throw error
        const { data } = supabase.storage.from('property-images').getPublicUrl(path)
        setImages((prev) => [...prev, data.publicUrl])
      }
    } catch (err) { toast.error(err.message || 'Upload failed') }
    setUploading(false); e.target.value = ''
  }

  const locate = () => {
    if (!navigator.geolocation) return toast.error('Location is not supported on this device')
    navigator.geolocation.getCurrentPosition(
      (pos) => { setF((p) => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })); toast.success('Location captured') },
      () => toast.error('Could not get your location'), { enableHighAccuracy: true })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!f.title.trim() || !f.area.trim()) return toast.error('Fill in the title and area')
    if (!(Number(f.price) > 0)) return toast.error('Enter a price in KSh')
    if (!images.length) return toast.error('Add at least one photo')
    setSaving(true)
    const payload = {
      title: f.title.trim(), description: f.description.trim() || null, listing_type: f.listing_type, property_type: f.property_type,
      price: Math.round(Number(f.price)), bedrooms: noRooms ? 0 : Number(f.bedrooms) || 0, bathrooms: Number(f.bathrooms) || 0,
      area_sqm: f.area_sqm ? Number(f.area_sqm) : null, county: f.county, area: f.area.trim(), address: f.address.trim() || null,
      latitude: f.latitude ? Number(f.latitude) : null, longitude: f.longitude ? Number(f.longitude) : null, amenities, images,
    }
    const { error } = edit
      ? await supabase.from('properties').update(payload).eq('id', id)
      : await supabase.from('properties').insert({ ...payload, owner_id: user.id })
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success(edit ? 'Listing updated' : 'Submitted! It will go live once approved.', { duration: 5000 })
    nav(isAdmin && edit ? '/admin/properties' : '/dashboard')
  }

  if (loading) return <Spinner className="min-h-[50vh]" />
  const Section = ({ title, children }) => <section className="card p-5 sm:p-6"><h2 className="mb-4 text-lg font-bold">{title}</h2>{children}</section>

  return (
    <form onSubmit={submit} className="container-x max-w-4xl space-y-5 py-6 sm:py-8">
      <PageHeader title={edit ? 'Edit listing' : 'List a property'} subtitle="Good photos and a clear description get more enquiries." />

      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Title</label><input className="input" value={f.title} onChange={upd('title')} placeholder="e.g. Modern 3 Bedroom Apartment in Kilimani" maxLength={120} required /></div>
          <div><label className="label">I want to</label>
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 text-sm font-semibold">{[['sale', 'Sell'], ['rent', 'Rent out']].map(([v, l]) => <button type="button" key={v} onClick={() => setF({ ...f, listing_type: v })} className={`rounded-md py-2 ${f.listing_type === v ? 'bg-white text-brand-700 shadow' : 'text-slate-600'}`}>{l}</button>)}</div></div>
          <div><label className="label">Property type</label><select className="input" value={f.property_type} onChange={upd('property_type')}>{PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label className="label">Price (KSh){f.listing_type === 'rent' && ' per month'}</label><input type="number" min="0" className="input" value={f.price} onChange={upd('price')} placeholder={f.listing_type === 'rent' ? '45000' : '12500000'} required /></div>
          <div><label className="label">Size (square metres)</label><input type="number" min="0" className="input" value={f.area_sqm} onChange={upd('area_sqm')} placeholder="120" /></div>
          {!noRooms && <div><label className="label">Bedrooms (0 = studio)</label><input type="number" min="0" max="20" className="input" value={f.bedrooms} onChange={upd('bedrooms')} /></div>}
          <div><label className="label">Bathrooms</label><input type="number" min="0" max="20" className="input" value={f.bathrooms} onChange={upd('bathrooms')} /></div>
          <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input min-h-[140px]" value={f.description} onChange={upd('description')} placeholder="Describe the property, neighbourhood, nearby schools, malls and transport..." /></div>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">County</label><select className="input" value={f.county} onChange={upd('county')}>{KENYA_COUNTIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="label">Area / estate</label><input className="input" value={f.area} onChange={upd('area')} placeholder="e.g. Kilimani, Nyali, Ruiru" required /></div>
          <div className="sm:col-span-2"><label className="label">Street or landmark (optional)</label><input className="input" value={f.address} onChange={upd('address')} placeholder="e.g. Argwings Kodhek Road" /></div>
          <div><label className="label">Latitude (optional)</label><input className="input" value={f.latitude} onChange={upd('latitude')} placeholder="-1.2921" /></div>
          <div><label className="label">Longitude (optional)</label><input className="input" value={f.longitude} onChange={upd('longitude')} placeholder="36.8219" /></div>
          <button type="button" onClick={locate} className="btn-outline sm:col-span-2"><LocateFixed className="h-4 w-4" /> Use my current location (if I'm at the property)</button>
        </div>
      </Section>

      <Section title="Features and amenities">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {AMENITIES.map((a) => (
            <label key={a} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${amenities.includes(a) ? 'border-brand-600 bg-brand-50 font-semibold text-brand-800' : 'border-slate-200'}`}>
              <input type="checkbox" className="accent-brand-600" checked={amenities.includes(a)} onChange={() => setAmenities((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a])} />{a}
            </label>
          ))}
        </div>
      </Section>

      <Section title={`Photos (${images.length}/10)`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((src, i) => (
            <div key={src} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="badge absolute left-2 top-2 bg-brand-600 text-white">Cover</span>}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/60 p-1.5">
                {i !== 0 ? <button type="button" onClick={() => setImages((p) => [p[i], ...p.filter((_, j) => j !== i)])} className="rounded bg-white/90 p-1" title="Make cover"><Star className="h-4 w-4" /></button> : <span />}
                <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="rounded bg-white/90 p-1 text-red-600" aria-label="Remove photo"><X className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {images.length < 10 && (
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-brand-600 hover:text-brand-700">
              {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}{uploading ? 'Uploading...' : 'Add photos'}
              <input type="file" accept="image/*" multiple className="hidden" onChange={upload} disabled={uploading} />
            </label>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-500">JPG, PNG or WebP, up to 5MB each. The first photo is your cover image.</p>
      </Section>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-outline" onClick={() => nav(-1)}>Cancel</button>
        <button className="btn-primary px-8" disabled={saving || uploading}>{saving ? 'Saving...' : edit ? 'Save changes' : 'Submit for approval'}</button>
      </div>
    </form>
  )
}
