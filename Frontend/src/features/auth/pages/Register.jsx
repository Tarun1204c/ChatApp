import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../hook/useAuth'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { handleRegister } = useAuth()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await handleRegister(formData)
      setSuccessMessage(response.message || 'Account created. Check your email to verify it.')
      setFormData({ username: '', email: '', password: '' })
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    window.location.assign(`${apiUrl}/api/auth/google`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-100 px-4 py-10 text-slate-800">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(244,114,182,0.18),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(251,207,232,0.18),transparent_32%)]" />
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-pink-100 bg-white/90 shadow-2xl shadow-pink-100/70 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7 sm:p-12 lg:order-2">
          <div className="mb-10">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">Convo</span>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-pink-500">Meet your AI agent</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Create your account</h1>
            <p className="mt-3 text-sm text-slate-500">Start thinking, creating, and getting more done with AI.</p>
          </div>

          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-pink-100 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:ring-offset-2 focus:ring-offset-white" onClick={handleGoogleSignup} type="button">
            <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">
              <svg viewBox="0 0 48 48" className="h-5 w-5" role="img" aria-label="Google logo">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.43 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.13 13.18 17.56 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.7c-.55 2.96-2.24 5.47-4.78 7.16l7.73 5.99C43.87 37.72 46.5 31.73 46.5 24.5z"/>
                <path fill="#FBBC05" d="M32.9 36.9c-2.08 1.41-4.74 2.25-8.9 2.25-6.67 0-12.3-4.51-14.29-10.56l-8.09 6.26C4.86 42.33 13.39 48 24 48c7.24 0 13.31-2.39 17.76-6.5l-8.86-4.6z"/>
                <path fill="#34A853" d="M9.7 28.6A14.85 14.85 0 0 1 9.2 24c0-1.66.29-3.26.8-4.6L2.56 13.2A23.96 23.96 0 0 0 0 24c0 3.84.92 7.47 2.56 10.8l7.14-6.2z"/>
              </svg>
            </span>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-pink-100" />
            <span>OR SIGN UP WITH EMAIL</span>
            <span className="h-px flex-1 bg-pink-100" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600" role="status">{successMessage}</p>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-username">Username</label>
              <input className="w-full rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200" id="register-username" name="username" onChange={handleChange} placeholder="Choose a username" required type="text" value={formData.username} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-email">Email address</label>
              <input className="w-full rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200" id="register-email" name="email" onChange={handleChange} placeholder="you@example.com" required type="email" value={formData.email} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-password">Password</label>
              <input className="w-full rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200" id="register-password" name="password" onChange={handleChange} placeholder="Create a password" required type="password" value={formData.password} />
            </div>
            <button className="w-full rounded-xl bg-pink-500 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-pink-500 hover:text-pink-600" to="/login">Sign in</Link></p>
        </div>

        <div className="hidden flex-col justify-between bg-gradient-to-br from-pink-400 to-pink-500 p-10 lg:order-1 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-50">Your AI companion</p>
            <h2 className="mt-20 max-w-sm text-5xl font-semibold leading-tight tracking-tight text-white">Join the conversation with the best AI agent.</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-pink-50">Ask better questions, explore ideas, and turn your thoughts into action.</p>
        </div>
      </section>
    </main>
  )
}

export default Register
