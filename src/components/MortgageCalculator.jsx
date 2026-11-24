import { useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'
import { formatKsh } from '../lib/utils'

export default function MortgageCalculator({ defaultPrice = 10000000, compact = false }) {
  const [price, setPrice] = useState(defaultPrice)
  const [depositPct, setDepositPct] = useState(20)
  const [rate, setRate] = useState(13)
  const [years, setYears] = useState(20)

  const r = useMemo(() => {
    const loan = Math.max(price * (1 - depositPct / 100), 0)
    const m = rate / 100 / 12
    const n = years * 12
    const monthly = m === 0 ? loan / n : (loan * m) / (1 - Math.pow(1 + m, -n))
    const total = monthly * n
    return { loan, monthly, total, interest: total - loan, deposit: price - loan, stamp: price * 0.04, legal: price * 0.015 }
  }, [price, depositPct, rate, years])

  const Field = ({ label, children }) => <div><label className="label">{label}</label>{children}</div>
  return (
    <div className={compact ? '' : 'card p-5 sm:p-6'}>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold"><Calculator className="h-5 w-5 text-brand-600" /> Mortgage calculator</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Property price (KSh)"><input type="number" min="0" className="input" value={price} onChange={(e) => setPrice(+e.target.value)} /></Field>
        <Field label={`Deposit: ${depositPct}%`}><input type="range" min="0" max="90" step="5" className="w-full accent-brand-600" value={depositPct} onChange={(e) => setDepositPct(+e.target.value)} /></Field>
        <Field label="Interest rate (% per year)"><input type="number" step="0.1" min="0" className="input" value={rate} onChange={(e) => setRate(+e.target.value)} /></Field>
        <Field label={`Loan term: ${years} years`}><input type="range" min="5" max="30" className="w-full accent-brand-600" value={years} onChange={(e) => setYears(+e.target.value)} /></Field>
      </div>
      <div className="mt-5 rounded-xl bg-brand-50 p-4 text-center">
        <p className="text-sm text-slate-600">Estimated monthly repayment</p>
        <p className="font-display text-3xl font-extrabold text-brand-700">{formatKsh(Math.round(r.monthly))}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {[['Deposit', r.deposit], ['Loan amount', r.loan], ['Total interest', r.interest], ['Total repayment', r.total], ['Stamp duty (about 4%)', r.stamp], ['Legal fees (about 1.5%)', r.legal]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-slate-200 p-3"><dt className="text-xs text-slate-500">{k}</dt><dd className="font-semibold">{formatKsh(Math.round(v))}</dd></div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-slate-400">Estimates only. Bank rates, stamp duty (2% outside municipalities) and legal fees vary. Confirm with your lender.</p>
    </div>
  )
}
