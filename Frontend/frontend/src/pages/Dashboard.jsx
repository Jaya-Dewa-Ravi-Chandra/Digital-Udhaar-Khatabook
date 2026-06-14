import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

export default function Dashboard() {
  const API = "https://digital-udhaar-khatabook.onrender.com"
const navigate = useNavigate()
  const { currentUser, signout } = useAuthStore()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' })
  const [error, setError] = useState('')
  const [trashCount, setTrashCount] = useState(0)

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API}/api/customers/get-customers`, { withCredentials: true })
      setCustomers(res.data.payload || [])
    } catch { setError('Failed to load customers.') }
    finally { setLoading(false) }
  }

  // fetch trash count for badge
  const fetchTrashCount = async () => {
    try {
      const res = await axios.get(`${API}/api/transactions/trash/all`, { withCredentials: true })
      setTrashCount(res.data.payload?.length || 0)
    } catch {}
  }

  useEffect(() => {
    fetchCustomers()
    fetchTrashCount()
  }, [])

  const handleSignout = async () => {
    await signout()
    navigate('/')
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API}/api/customers/upload-customer`, newCustomer, { withCredentials: true })
      setShowAddModal(false)
      setNewCustomer({ name: '', phone: '' })
      fetchCustomers()
    } catch { setError('Failed to add customer.') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    await axios.delete(`${API}/api/customers/delete-customerById/${id}`, { withCredentials: true })
    fetchCustomers()
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📒</span>
          <span className="text-xl font-bold text-gray-900">UdhaarBook</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">
            Hello, <span className="font-medium text-gray-800">{currentUser?.Name}</span>
          </span>

          {/* Trash bin with badge */}
          <button
            onClick={() => navigate('/trash')}
            title="View Trash"
            className="relative p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
            {/* Badge — only shows if trash has items */}
            {trashCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {trashCount > 99 ? '99+' : trashCount}
              </span>
            )}
          </button>

          <button
            onClick={handleSignout}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Customers</h1>
            <p className="text-sm text-gray-500 mt-0.5">Tap a customer to view transactions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all"
          >
            + Add Customer
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">👥</span>
            <p className="mt-4 text-gray-500 text-sm">No customers yet. Add your first one!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {customers.map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/customers/${c._id}/transactions`)}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📞 {c.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(c._id) }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                  <span className="text-gray-300">→</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Customer</h3>
            <form onSubmit={handleAddCustomer} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Customer name"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  required
                  type="number"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="10-digit phone"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
