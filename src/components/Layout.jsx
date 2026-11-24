import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import BottomNav from './BottomNav'
import InstallPrompt from './InstallPrompt'

export default function Layout() {
  const [online, setOnline] = useState(navigator.onLine)
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  return (
    <div className="flex min-h-screen flex-col">
      {!online && <div className="flex items-center justify-center gap-2 bg-slate-800 py-1.5 text-xs font-medium text-white"><WifiOff className="h-3.5 w-3.5" /> You are offline. Some content may not load.</div>}
      <Navbar />
      <main className="flex-1 pb-safe md:pb-0"><Outlet /></main>
      <Footer />
      <BottomNav />
      <InstallPrompt />
    </div>
  )
}
