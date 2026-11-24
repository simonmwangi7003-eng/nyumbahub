import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { isConfigured } from './lib/supabase'
import SetupNotice from './components/SetupNotice'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Listings from './pages/Listings'
import PropertyDetail from './pages/PropertyDetail'
import { Login, Register } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import PropertyForm from './pages/PropertyForm'
import Mortgage from './pages/Mortgage'
import About from './pages/About'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProperties from './pages/admin/AdminProperties'
import AdminUsers from './pages/admin/AdminUsers'
import AdminInquiries from './pages/admin/AdminInquiries'

export default function App() {
  if (!isConfigured) return <SetupNotice />
  return (
    <AuthProvider>
      <FavoritesProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="properties" element={<Listings />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="mortgage" element={<Mortgage />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="dashboard/new" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="dashboard/edit/:id" element={<ProtectedRoute><PropertyForm /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute admin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="inquiries" element={<AdminInquiries />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </FavoritesProvider>
    </AuthProvider>
  )
}
