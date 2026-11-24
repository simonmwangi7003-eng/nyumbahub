import MortgageCalculator from '../components/MortgageCalculator'
export default function Mortgage() {
  return (
    <div className="container-x max-w-3xl py-8">
      <h1 className="text-3xl font-extrabold">Mortgage calculator</h1>
      <p className="mb-6 mt-1 text-slate-500">Work out your monthly repayment in Kenya Shillings before you start house hunting.</p>
      <MortgageCalculator />
    </div>
  )
}
