import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function SignUp() {
  const navigate = useNavigate()
  const { signup, loading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ Name: '', email: '', password: '' })

  const handleChange = (e) => {
    clearError()
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await signup(form)
    if (result.success) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8">

        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">📒</span>
          <span className="text-xl font-bold text-gray-900">UdhaarBook</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
        <p className="text-sm text-gray-500 mb-6">Start managing your khata today</p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="Name" type="text" required value={form.Name}
              onChange={handleChange} placeholder="Rahul Sharma"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email" type="email" required value={form.email}
              onChange={handleChange} placeholder="you@example.com"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password" type="password" required value={form.password}
              onChange={handleChange} placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="mt-2 w-full py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/signin" className="text-indigo-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}