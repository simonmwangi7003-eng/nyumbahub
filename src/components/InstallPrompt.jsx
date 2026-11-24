import { useEffect, useState } from 'react'
import { Download, Share, PlusSquare, X } from 'lucide-react'

const KEY = 'nyumbahub-install-dismissed'
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [show, setShow] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    const dismissedAt = Number(localStorage.getItem(KEY) || 0)
    const recentlyDismissed = Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000
    if (recentlyDismissed) return

    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); setTimeout(() => setShow(true), 2500) }
    const onInstalled = () => { setShow(false); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)

    let t
    if (isIos()) { setIosHelp(true); t = setTimeout(() => setShow(true), 4000) }
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); clearTimeout(t) }
  }, [])

  const dismiss = () => { localStorage.setItem(KEY, String(Date.now())); setShow(false) }
  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') setShow(false); else dismiss()
    setDeferred(null)
  }

  if (!show) return null
  return (
    <div className="slide-up fixed inset-x-3 bottom-[4.75rem] z-50 mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:mx-0" role="dialog" aria-label="Install NyumbaHub app">
      <button onClick={dismiss} className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100" aria-label="Dismiss"><X className="h-4 w-4" /></button>
      <div className="flex items-start gap-3">
        <img src="/pwa-192x192.png" alt="" className="h-12 w-12 rounded-xl" />
        <div className="pr-5">
          <h3 className="font-display text-base font-bold">Install NyumbaHub</h3>
          <p className="mt-0.5 text-sm text-slate-600">Add the app to your home screen for faster searching, saved homes and an app-like experience.</p>
        </div>
      </div>
      {iosHelp && !deferred ? (
        <p className="mt-3 flex flex-wrap items-center gap-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          Tap <Share className="inline h-4 w-4 text-blue-600" /> Share, then <PlusSquare className="inline h-4 w-4" /> <b>Add to Home Screen</b>.
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <button onClick={install} className="btn-primary flex-1"><Download className="h-4 w-4" /> Install app</button>
          <button onClick={dismiss} className="btn-ghost">Not now</button>
        </div>
      )}
    </div>
  )
}
