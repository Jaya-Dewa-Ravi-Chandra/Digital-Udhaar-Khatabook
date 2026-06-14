import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { currentUser, signout } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/common/users', { withCredentials: true })
      setUsers(res.data.payload || [])
    } catch { setError('Failed to load users.') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSignout = async () => {
    await signout()
    navigate('/')
  }

  const handleBlock = async (id) => {
    try {
      await axios.put(`/api/common/block-user/${id}`, {}, { withCredentials: true })
      fetchUsers()
    } catch (err) { setError(err.response?.data?.message || 'Failed to block user.') }
  }

  const handleUnblock = async (id) => {
    try {
      await axios.put(`/api/common/unblock-user/${id}`, {}, { withCredentials: true })
      fetchUsers()
    } catch (err) { setError(err.response?.data?.message || 'Failed to unblock user.') }
  }

  const activeUsers = users.filter(u => u.isActive).length
  const blockedUsers = users.filter(u => !u.isActive).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📒</span>
          <span className="text-xl font-bold text-gray-900">UdhaarBook</span>
          <span className="ml-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden md:block font-medium text-gray-800">{currentUser?.Name}</span>
          <button onClick={handleSignout} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all registered users</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-500">{activeUsers}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">Blocked</p>
            <p className="text-2xl font-bold text-red-500">{blockedUsers}</p>
          </div>
        </div>

        {error && <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${i !== users.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{u.Name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.role !== 'ADMIN' && (
                        u.isActive ? (
                          <button onClick={() => handleBlock(u._id)} className="px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                            Block
                          </button>
                        ) : (
                          <button onClick={() => handleUnblock(u._id)} className="px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                            Unblock
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}