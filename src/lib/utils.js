export const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || '+254700000000'
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'hello@nyumbahub.co.ke'

export const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa','Homa Bay','Isiolo','Kajiado',
  'Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia',
  'Lamu','Machakos','Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",'Nairobi',
  'Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya','Taita-Taveta','Tana River',
  'Tharaka-Nithi','Trans Nzoia','Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot',
]

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'maisonette', label: 'Maisonette' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'land', label: 'Land / Plot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
]

export const AMENITIES = [
  'Parking','Security','CCTV','Borehole','Water','Electricity','Backup Generator','Solar Water Heating','Swimming Pool','Gym',
  'Garden','Balcony','Lift','DSQ','Fireplace','Furnished','High-speed Internet','Playground','Sea View','Lake View',
  'Mountain View','Tiled Floors','Prepaid Meter','Tarmac Road','Title Deed',
]

export const typeLabel = (v) => PROPERTY_TYPES.find((t) => t.value === v)?.label || v

export const formatKsh = (n) => `KSh ${Number(n || 0).toLocaleString('en-KE')}`

export const formatKshShort = (n) => {
  n = Number(n || 0)
  if (n >= 1e9) return `KSh ${(n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1)}B`
  if (n >= 1e6) return `KSh ${(n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1)}M`
  if (n >= 1e3) return `KSh ${(n / 1e3).toFixed(0)}K`
  return `KSh ${n}`
}

export const formatPrice = (p) =>
  p.listing_type === 'rent' ? `${formatKsh(p.price)}/mo` : formatKsh(p.price)

export const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// Kenyan mobile numbers: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, 2541XXXXXXXX
export const isKenyanPhone = (v = '') => /^(?:\+?254|0)(7|1)\d{8}$/.test(v.replace(/[\s-]/g, ''))
export const normalizePhone = (v = '') => {
  const c = v.replace(/[\s-]/g, '')
  if (/^0(7|1)\d{8}$/.test(c)) return `+254${c.slice(1)}`
  if (/^254(7|1)\d{8}$/.test(c)) return `+${c}`
  return c
}
export const waLink = (phone, text) =>
  `https://wa.me/${normalizePhone(phone).replace('+', '')}?text=${encodeURIComponent(text || '')}`

export const FALLBACK_IMG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#d5ece0"/><path d="M250 330 400 210l150 120v110H250z" fill="#0b6b4a" opacity=".35"/></svg>`)

export const statusStyles = {
  approved: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-700',
  closed: 'bg-slate-200 text-slate-700',
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-amber-100 text-amber-800',
}
