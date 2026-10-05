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
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7 sm:p-12 lg:order-2">
          <div className="mb-10">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Convo</span>
          </div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-neutral-300">Meet your AI agent</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Create your account</h1>
            <p className="mt-3 text-sm text-neutral-400">Start thinking, creating, and getting more done with AI.</p>
          </div>

          <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-700 bg-black px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-950" onClick={handleGoogleSignup} type="button">
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

          <div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-700" />
            <span>OR SIGN UP WITH EMAIL</span>
            <span className="h-px flex-1 bg-neutral-700" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {errorMessage && (
              <p className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white" role="alert">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white" role="status">{successMessage}</p>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium text-white" htmlFor="register-username">Username</label>
              <input className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white focus:ring-2 focus:ring-neutral-700" id="register-username" name="username" onChange={handleChange} placeholder="Choose a username" required type="text" value={formData.username} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white" htmlFor="register-email">Email address</label>
              <input className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white focus:ring-2 focus:ring-neutral-700" id="register-email" name="email" onChange={handleChange} placeholder="you@example.com" required type="email" value={formData.email} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white" htmlFor="register-password">Password</label>
              <input className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white focus:ring-2 focus:ring-neutral-700" id="register-password" name="password" onChange={handleChange} placeholder="Create a password" required type="password" value={formData.password} />
            </div>
            <button className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-black transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-400">Already have an account? <Link className="font-semibold text-white hover:text-neutral-300" to="/login">Sign in</Link></p>
        </div>

        <div className="hidden flex-col justify-between bg-neutral-900 p-10 lg:order-1 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Your AI companion</p>
            <h2 className="mt-20 max-w-sm text-5xl font-semibold leading-tight tracking-tight text-white">Join the conversation with the best AI agent.</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-neutral-300">Ask better questions, explore ideas, and turn your thoughts into action.</p>
        </div>
      </section>
    </main>
  )
}

export default Register
