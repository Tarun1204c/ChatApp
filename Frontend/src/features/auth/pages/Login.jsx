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
        <main className="flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white">
            <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="hidden flex-col justify-between bg-neutral-900 p-10 lg:flex">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Convo</span>
                        <h1 className="mt-20 max-w-sm text-5xl font-semibold leading-tight tracking-tight text-white">Your AI assistant, ready when you are.</h1>
                    </div>
                    <p className="max-w-xs text-sm leading-6 text-neutral-300">Think, create, and get things done with an AI companion built for you.</p>
                </div>

                <div className="p-7 sm:p-12">
                    <div className="mb-10 lg:hidden">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Convo</span>
                    </div>
                    <div className="mb-8">
                        <p className="mb-3 text-sm font-medium text-neutral-300">Welcome back</p>
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Sign in to your account</h2>
                        <p className="mt-3 text-sm text-neutral-400">Pick up where you left off.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && <p className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white" role="alert">{error}</p>}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-white" htmlFor="login-email">Email address</label>
                            <input
                                className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white focus:ring-2 focus:ring-neutral-700"
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
                                <label className="block text-sm font-medium text-white" htmlFor="login-password">Password</label>
                                <button className="text-xs font-medium text-neutral-300 transition hover:text-white" type="button">Forgot password?</button>
                            </div>
                            <input
                                className="w-full rounded-xl border border-neutral-700 bg-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white focus:ring-2 focus:ring-neutral-700"
                                id="login-password"
                                name="password"
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                type="password"
                                value={formData.password}
                            />
                        </div>
                        <button className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-black transition hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-neutral-400">New to Convo? <Link className="font-semibold text-white hover:text-neutral-300" to="/register">Create an account</Link></p>
                </div>
            </section>
        </main>
    )
}

export default Login