import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

export default function TrashBin() {
  const navigate = useNavigate()
  const { signout } = useAuthStore()
  const [trashedTxns, setTrashedTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null) // track which row is loading
  const API="https://digital-udhaar-khatabook.onrender.com"
  const fetchTrash = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/api/transactions/trash/all`, { withCredentials: true })
      setTrashedTxns(res.data.payload || [])
    } catch { setError('Failed to load trash.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTrash() }, [])

  // ── RESTORE ──────────────────────────────────────────
  const handleRestore = async (id) => {
    setActionLoading(id + '_restore')
    try {
      await axios.put(`${API}/api/transactions/restore/${id}`, {}, { withCredentials: true })
      fetchTrash()
    } catch { setError('Failed to restore transaction.') }
    finally { setActionLoading(null) }
  }

  // ── HARD DELETE ──────────────────────────────────────
  const handleHardDelete = async (id) => {
    if (!confirm('Permanently delete this transaction? This cannot be undone.')) return
    setActionLoading(id + '_delete')
    try {
      await axios.delete(`${API}/api/transactions/hard/${id}`, { withCredentials: true })
      fetchTrash()
    } catch { setError('Failed to delete transaction.') }
    finally { setActionLoading(null) }
  }

  // ── HARD DELETE ALL ──────────────────────────────────
  const handleEmptyTrash = async () => {
    if (!confirm(`Permanently delete all ${trashedTxns.length} transactions? This cannot be undone.`)) return
    try {
      await Promise.all(
        trashedTxns.map(t => axios.delete(`${API}/api/transactions/hard/${t._id}`, { withCredentials: true }))
      )
      fetchTrash()
    } catch { setError('Failed to empty trash.') }
  }

  const handleSignout = async () => { await signout(); navigate('/') }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 text-lg transition-colors">←</button>
          <span className="text-xl font-bold text-gray-900">📒 UdhaarBook</span>
        </div>
        <button onClick={handleSignout} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Sign Out</button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
              Trash
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Restore or permanently delete transactions</p>
          </div>
          {trashedTxns.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 active:scale-95 transition-all"
            >
              Empty Trash
            </button>
          )}
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : trashedTxns.length === 0 ? (
          <div className="text-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
            <p className="text-gray-400 text-sm font-medium">Trash is empty</p>
            <p className="text-gray-300 text-xs mt-1">Deleted transactions will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {trashedTxns.map((t) => (
              <div key={t._id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">

                {/* Left — info */}
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${t.type === 'credit' ? 'bg-red-50 text-red-400' : 'bg-green-50 text-green-400'}`}>
                    {t.type === 'credit' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {t.description || (t.type === 'credit' ? 'Udhaar given' : 'Payment received')}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-400">
                        {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <span className="text-gray-200">•</span>
                      <p className="text-xs text-red-300">
                        Deleted {new Date(t.deletedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right — amount + actions */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-red-400' : 'text-green-400'}`}>
                      {t.type === 'credit' ? '-' : '+'}₹{t.amount}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'PAID' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-400'}`}>
                      {t.status}
                    </span>
                  </div>

                  {/* Restore */}
                  <button
                    onClick={() => handleRestore(t._id)}
                    disabled={actionLoading === t._id + '_restore'}
                    title="Restore transaction"
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading === t._id + '_restore' ? '...' : '↩ Restore'}
                  </button>

                  {/* Hard delete */}
                  <button
                    onClick={() => handleHardDelete(t._id)}
                    disabled={actionLoading === t._id + '_delete'}
                    title="Delete permanently"
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading === t._id + '_delete' ? '...' : 'Delete'}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
