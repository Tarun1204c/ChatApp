import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useAuth } from '../hook/useAuth'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const navigate = useNavigate()
    const { handleLogin } = useAuth()
    const user = useSelector((state) => state.auth.user)
    const loading = useSelector((state) => state.auth.loading)
    const error = useSelector((state) => state.auth.error)

    if (user) {
        return <Navigate to="/" replace />
    }

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((currentData) => ({ ...currentData, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        try {
            await handleLogin(formData)
            navigate('/')
        } catch {
            // The auth hook stores the API error in Redux for the page to display.
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-100 px-4 py-10 text-slate-800">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(244,114,182,0.18),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(251,207,232,0.18),transparent_30%)]" />
            <section className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-pink-100 bg-white/90 shadow-2xl shadow-pink-100/70 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
                <div className="hidden flex-col justify-between bg-gradient-to-br from-pink-400 to-pink-500 p-10 lg:flex">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-50">Convo</span>
                        <h1 className="mt-20 max-w-sm text-5xl font-semibold leading-tight tracking-tight text-white">Your AI assistant, ready when you are.</h1>
                    </div>
                    <p className="max-w-xs text-sm leading-6 text-pink-50">Think, create, and get things done with an AI companion built for you.</p>
                </div>

                <div className="p-7 sm:p-12">
                    <div className="mb-10 lg:hidden">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">Convo</span>
                    </div>
                    <div className="mb-8">
                        <p className="mb-3 text-sm font-medium text-pink-500">Welcome back</p>
                        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Sign in to your account</h2>
                        <p className="mt-3 text-sm text-slate-500">Pick up where you left off.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="login-email">Email address</label>
                            <input
                                className="w-full rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                                id="login-email"
                                name="email"
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                type="email"
                                value={formData.email}
                            />
                        </div>
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700" htmlFor="login-password">Password</label>
                                <button className="text-xs font-medium text-pink-500 transition hover:text-pink-600" type="button">Forgot password?</button>
                            </div>
                            <input
                                className="w-full rounded-xl border border-pink-100 bg-pink-50/60 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
                                id="login-password"
                                name="password"
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                type="password"
                                value={formData.password}
                            />
                        </div>
                        <button className="w-full rounded-xl bg-pink-500 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">New to Convo? <Link className="font-semibold text-pink-500 hover:text-pink-600" to="/register">Create an account</Link></p>
                </div>
            </section>
        </main>
    )
}

export default Login