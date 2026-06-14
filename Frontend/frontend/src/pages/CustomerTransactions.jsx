import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

export default function CustomerTransactions() {
  const { customerId } = useParams()
  const API = "https://digital-udhaar-khatabook.onrender.com"
const navigate = useNavigate()
  const { signout } = useAuthStore()
  const [transactions, setTransactions] = useState([])
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [txnType, setTxnType] = useState('credit')
  const [form, setForm] = useState({ amount: '', description: '' })
  const [error, setError] = useState('')

  const fetchData = async () => {
    try {
      const [custRes, txnRes] = await Promise.all([
        axios.get(`${API}/api/customers/get-customerById/${customerId}`, { withCredentials: true }),
        axios.get(`${API}/api/transactions/${customerId}`, { withCredentials: true }),
      ])
      setCustomer(custRes.data.payload)
      setTransactions(txnRes.data.payload || [])
    } catch { setError('Failed to load data.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [customerId])

  const totalCredit = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalDebit = transactions.filter(t => t.status === 'PAID').reduce((s, t) => s + t.amount, 0)
  const balance = transactions.filter(t => t.status === 'NOT PAID').reduce((s, t) => s + t.amount, 0)

  const handleAddTxn = async (e) => {
    e.preventDefault()
    try {
      if (txnType === 'cash') {
        // cash received = create a debit entry (customer paid in cash)
        await axios.post(`${API}/api/transactions/debit`, {
          customerId, amount: Number(form.amount), description: form.description || 'Cash received'
        }, { withCredentials: true })
      } else {
        await axios.post(`${API}/api/transactions/${txnType}`, {
          customerId, amount: Number(form.amount), description: form.description
        }, { withCredentials: true })
      }
      setShowModal(false)
      setForm({ amount: '', description: '' })
      fetchData()
    } catch { setError('Failed to add transaction.') }
  }

  // ── SOFT DELETE ──────────────────────────────────────
  const handleSoftDelete = async (id) => {
    if (!confirm('Move this transaction to trash?')) return
    try {
      await axios.delete(`${API}/api/transactions/soft/${id}`, { withCredentials: true })
      fetchData()
    } catch { setError('Failed to move to trash.') }
  }

  // ── CASH PAYMENT — marks transaction as PAID directly ─
  const handleCashPay = async (id) => {
    if (!confirm('Mark this transaction as paid via cash?')) return
    try {
      await axios.put(`${API}/api/transactions/${id}`, { status: 'PAID' }, { withCredentials: true })
      fetchData()
    } catch { setError('Failed to mark as paid.') }
  }

  const handlePayNow = async (transactionId) => {
    const res = await axios.post(`${API}/api/payment/create-order/${transactionId}`, {}, { withCredentials: true })
    if (!res.data.success) return alert('Failed to create order')
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: res.data.order.amount,
      currency: 'INR',
      order_id: res.data.order.id,
      handler: async (response) => {
        const verifyRes = await axios.post(`${API}/api/payment/verify`, {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }, { withCredentials: true })
        if (verifyRes.data.success) { alert('Payment successful!'); fetchData() }
      },
    }
    new window.Razorpay(options).open()
  }

  const handleSignout = async () => { await signout(); navigate('/') }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER — no trash bin here, it lives in Dashboard */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-gray-700 text-lg transition-colors"
          >
            ←
          </button>
          <span className="text-xl font-bold text-gray-900">📒 UdhaarBook</span>
        </div>
        <button
          onClick={handleSignout}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Sign Out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : (
          <>
            {/* Customer info */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{customer?.name}</h1>
              <p className="text-sm text-gray-400 mt-0.5">📞 {customer?.phone}</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Total Udhaar</p>
                <p className="text-xl font-bold text-red-500">₹{totalCredit}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Total Paid</p>
                <p className="text-xl font-bold text-green-500">₹{totalDebit}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Balance Due</p>
                <p className={`text-xl font-bold ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ₹{Math.abs(balance)}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => { setTxnType('credit'); setShowModal(true) }}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 active:scale-95 transition-all"
              >
                + Add Udhaar
              </button>
              <button
                onClick={() => { setTxnType('debit'); setShowModal(true) }}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 active:scale-95 transition-all"
              >
                + Record Payment
              </button>
              <button
                onClick={() => { setTxnType('cash'); setShowModal(true) }}
                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:scale-95 transition-all"
              >
                💵 Cash Received
              </button>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
            )}

            {/* Transactions list */}
            {transactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">No transactions yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {transactions.map((t) => (
                  <div key={t._id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${t.type === 'credit' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        {t.type === 'credit' ? '↑' : '↓'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {t.description || (t.type === 'credit' ? 'Udhaar given' : 'Payment received')}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-red-500' : 'text-green-500'}`}>
                          {t.type === 'credit' ? '-' : '+'}₹{t.amount}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-500'}`}>
                          {t.status}
                        </span>
                      </div>
                      {t.type === 'credit' && t.status === 'NOT PAID' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePayNow(t._id)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Pay Now
                          </button>
                          <button
                            onClick={() => handleCashPay(t._id)}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            💵 Cash
                          </button>
                        </div>
                      )}
                      {/* SOFT DELETE */}
                      <button
                        onClick={() => handleSoftDelete(t._id)}
                        title="Move to trash"
                        className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ADD TRANSACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {txnType === 'credit' ? '📤 Add Udhaar' : txnType === 'debit' ? '📥 Record Payment' : '💵 Cash Received'}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {txnType === 'credit' ? 'Amount given to customer' : txnType === 'debit' ? 'Amount received from customer' : 'Mark cash collected from customer'}
            </p>
            <form onSubmit={handleAddTxn} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  required type="number" min="1" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Groceries, Rent..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 text-sm font-semibold text-white rounded-lg ${txnType === 'credit' ? 'bg-red-500 hover:bg-red-600' : txnType === 'debit' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-800 hover:bg-gray-900'}`}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
