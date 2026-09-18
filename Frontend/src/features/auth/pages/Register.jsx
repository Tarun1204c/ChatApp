import { useState } from 'react'
import { Link } from 'react-router'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Registration submitted:', formData)
  }

  const handleGoogleSignup = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.assign(`${apiUrl}/api/auth/google`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(99,102,241,0.2),transparent_32%)]" />
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7 sm:p-12 lg:order-2">
          <div className="mb-10">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Convo</span>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-cyan-300">Meet your AI agent</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Create your account</h1>
            <p className="mt-3 text-sm text-slate-400">Start thinking, creating, and getting more done with AI.</p>
          </div>

          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900" onClick={handleGoogleSignup} type="button">
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 48 48">
              <path d="M48 24c0-1.62-.15-3.18-.42-4.68H24v9.02h13.48c-.58 2.98-2.32 5.5-4.94 7.18v5.85h7.99C45.2 36.1 48 30.6 48 24Z" fill="#4285F4" />
              <path d="M24 48c6.48 0 11.92-2.15 15.89-5.83l-7.99-5.85c-2.15 1.44-4.89 2.3-7.9 2.3-6.08 0-11.24-4.11-13.08-9.64H2.66v6.03C6.6 42.45 14.77 48 24 48Z" fill="#34A853" />
              <path d="M10.92 28.98A14.4 14.4 0 0 1 10.16 24c0-1.73.3-3.41.76-4.98v-6.03H2.66A24 24 0 0 0 0 24c0 3.87.93 7.53 2.66 11.01l8.26-6.03Z" fill="#FBBC05" />
              <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.84-6.84C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.66 12.99l8.26 6.03C12.76 13.61 17.92 9.5 24 9.5Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            <span>OR SIGN UP WITH EMAIL</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="register-username">Username</label>
              <input className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" id="register-username" name="username" onChange={handleChange} placeholder="Choose a username" required type="text" value={formData.username} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="register-email">Email address</label>
              <input className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" id="register-email" name="email" onChange={handleChange} placeholder="you@example.com" required type="email" value={formData.email} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="register-password">Password</label>
              <input className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20" id="register-password" name="password" onChange={handleChange} placeholder="Create a password" required type="password" value={formData.password} />
            </div>
            <button className="w-full rounded-xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900" type="submit">Create account</button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">Already have an account? <Link className="font-semibold text-cyan-300 hover:text-cyan-200" to="/login">Sign in</Link></p>
        </div>

        <div className="hidden flex-col justify-between bg-cyan-500 p-10 lg:order-1 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-950">Your AI companion</p>
            <h2 className="mt-20 max-w-sm text-5xl font-semibold leading-tight tracking-tight text-slate-950">Join the conversation with the best AI agent.</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-cyan-950/75">Ask better questions, explore ideas, and turn your thoughts into action.</p>
        </div>
      </section>
    </main>
  )
}

export default Register
