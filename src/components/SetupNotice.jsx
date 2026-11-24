export default function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 p-6">
      <div className="card max-w-lg p-8">
        <h1 className="text-2xl font-extrabold">Connect Supabase to get started</h1>
        <p className="mt-2 text-slate-600">The app can't find your Supabase credentials. Do this:</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Copy <code className="rounded bg-slate-100 px-1">.env.example</code> to <code className="rounded bg-slate-100 px-1">.env</code></li>
          <li>Paste your project URL and anon key from Supabase &rarr; Project Settings &rarr; API</li>
          <li>Run <code className="rounded bg-slate-100 px-1">supabase/schema.sql</code> in the Supabase SQL editor</li>
          <li>Restart <code className="rounded bg-slate-100 px-1">npm run dev</code></li>
        </ol>
        <p className="mt-4 text-sm text-slate-500">Full steps are in README.md.</p>
      </div>
    </div>
  )
}
