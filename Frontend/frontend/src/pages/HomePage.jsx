import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📒</span>
          <span className="text-xl font-bold text-gray-900 tracking-tight">UdhaarBook</span>
        </div>
        <nav className="flex items-center gap-3">
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign Up
          </button>
        </nav>
      </header>

      {/* HERO */}
      <main className="flex-1 flex items-center px-6 md:px-12 py-16 max-w-6xl mx-auto w-full gap-12">

        {/* LEFT — text */}
        <div className="flex-1 flex flex-col gap-5">
          <span className="w-fit text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Smart Khata Management
          </span>

          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Track credit.<br />
            Collect faster.<br />
            <span className="text-indigo-600">Stay in control.</span>
          </h1>

          <p className="text-base text-gray-500 leading-relaxed max-w-md">
            UdhaarBook helps small business owners manage customer dues,
            record transactions, and collect payments — all in one place.
            No more paper khata. No more forgotten udhaars.
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            <button
              onClick={() => navigate('/signup')}
              className="px-7 py-3 text-base font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="px-7 py-3 text-base font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
            >
              Already have an account?
            </button>
          </div>
        </div>

        {/* RIGHT — gif slot */}
        <div className="flex-1 flex justify-center items-center">
          <div className="w-full max-w-lg aspect-[4/3] overflow-hidden flex items-center justify-center">
            <img
              src="/hero.gif"
              alt="UdhaarBook in action"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
            />
            <div
              style={{ display: 'none' }}
              className="flex-col items-center justify-center gap-3 w-full h-full text-center p-6"
            >
              <span className="text-5xl">🎬</span>
              <p className="text-sm font-medium text-gray-500">Drop your GIF here</p>
              <code className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">public/hero.gif</code>
            </div>
          </div>
        </div>

      </main>

    </div>
  )
}