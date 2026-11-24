import { Loader2, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Spinner = ({ className = '' }) => (
  <div className={`flex items-center justify-center py-16 ${className}`} role="status" aria-label="Loading">
    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
  </div>
)

export const FullPageSpinner = () => (
  <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-brand-600" /></div>
)

export function EmptyState({ icon: Icon = SearchX, title, text, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon className="h-7 w-7" /></span>
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
      {action && <Link to={action.to} className="btn-primary mt-5">{action.label}</Link>}
    </div>
  )
}

export const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />

export const CardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="h-48 rounded-none" />
    <div className="space-y-3 p-4"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-4 w-2/3" /></div>
  </div>
)

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </div>
)
