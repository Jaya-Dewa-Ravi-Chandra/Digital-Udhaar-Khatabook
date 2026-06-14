import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import HomePage from './pages/HomePage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import CustomerTransactions from './pages/CustomerTransactions'
import AdminDashboard from './pages/AdminDashboard'
import TrashBin from './pages/TrashBin'

// ── Protected Route ────────────────────────────────────
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, currentUser, loading } = useAuthStore()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Loading...
    </div>
  )
  if (!isAuthenticated) return <Navigate to="/signin" replace />
  if (requiredRole && currentUser?.role !== requiredRole) return <Navigate to="/dashboard" replace />
  return children
}

// ── Public Route ───────────────────────────────────────
function PublicRoute({ children }) {
  const { isAuthenticated, currentUser, loading } = useAuthStore()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Loading...
    </div>
  )
  if (isAuthenticated) return <Navigate to={currentUser?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
  return children
}

// ── App ────────────────────────────────────────────────
function App() {
  const { checkAuth } = useAuthStore()

  useEffect(() => { checkAuth() }, [])

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<HomePage />} />

        <Route path="/signin" element={
          <PublicRoute><SignIn /></PublicRoute>
        } />

        <Route path="/signup" element={
          <PublicRoute><SignUp /></PublicRoute>
        } />

        {/* User Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="USER"><Dashboard /></ProtectedRoute>
        } />

        <Route path="/customers/:customerId/transactions" element={
          <ProtectedRoute requiredRole="USER"><CustomerTransactions /></ProtectedRoute>
        } />

        <Route path="/trash" element={
          <ProtectedRoute requiredRole="USER"><TrashBin /></ProtectedRoute>
        } />

        {/* Admin Protected */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App