import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isKenyanPhone, normalizePhone } from '../lib/utils'

function Shell({ title, subtitle, children, footer }) {
  return (
    <div className="container-x flex justify-center py-10 sm:py-16">
      <div className="w-full max-w-md">
        <div className="card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
        <p className="mt-5 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </div>
  )
}

const PasswordInput = ({ value, onChange, placeholder = 'Password', autoComplete }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input className="input pr-10" type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} required minLength={6} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-slate-400" aria-label="Toggle password visibility">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
    </div>
  )
}

export function Login() {
  const { signIn, resetPassword, user } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) return toast.error(error.message === 'Invalid login credentials' ? 'Wrong email or password' : error.message)
    toast.success('Welcome back'); nav(from, { replace: true })
  }
  const forgot = async () => {
    if (!email) return toast.error('Enter your email first')
    const { error } = await resetPassword(email.trim())
    error ? toast.error(error.message) : toast.success('Password reset link sent to your email')
  }
  return (
    <Shell title="Welcome back" subtitle="Log in to manage listings, saved homes and viewings." footer={<>New to NyumbaHub? <Link to="/register" className="font-semibold text-brand-700">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></div>
        <div><label className="label">Password</label><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        <button type="button" onClick={forgot} className="text-sm font-medium text-brand-700 hover:underline">Forgot password?</button>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      </form>
    </Shell>
  )
}

export function Register() {
  const { signUp, user } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ full_name: '', email: '', phone: '', password: '', role: 'user' })
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/dashboard" replace />
  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!isKenyanPhone(f.phone)) return toast.error('Enter a valid Kenyan phone number, e.g. 0712 345 678')
    setBusy(true)
    const { data, error } = await signUp({ ...f, email: f.email.trim(), full_name: f.full_name.trim(), phone: normalizePhone(f.phone) })
    setBusy(false)
    if (error) return toast.error(error.message)
    if (!data.session) { toast.success('Account created. Check your email to confirm, then log in.', { duration: 6000 }); return nav('/login') }
    toast.success('Account created. Karibu!'); nav('/dashboard')
  }
  return (
    <Shell title="Create your account" subtitle="Save homes, book viewings and list your own properties." footer={<>Already registered? <Link to="/login" className="font-semibold text-brand-700">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[['user', 'Buyer or tenant'], ['agent', 'Agent or landlord']].map(([v, l]) => (
            <button type="button" key={v} onClick={() => setF({ ...f, role: v })} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold ${f.role === v ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600'}`}>{l}</button>
          ))}
        </div>
        <div><label className="label">Full name</label><input className="input" value={f.full_name} onChange={upd('full_name')} placeholder="Wanjiru Kamau" autoComplete="name" required /></div>
        <div><label className="label">Email</label><input className="input" type="email" value={f.email} onChange={upd('email')} placeholder="you@example.com" autoComplete="email" required /></div>
        <div><label className="label">Phone number</label><input className="input" inputMode="tel" value={f.phone} onChange={upd('phone')} placeholder="0712 345 678" autoComplete="tel" required /></div>
        <div><label className="label">Password</label><PasswordInput value={f.password} onChange={upd('password')} placeholder="At least 6 characters" autoComplete="new-password" /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
      </form>
    </Shell>
  )
}
