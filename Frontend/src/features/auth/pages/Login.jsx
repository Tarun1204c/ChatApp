import { useState } from 'react'
import { Link } from 'react-router'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((currentData) => ({ ...currentData, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        console.log('Login submitted:', formData)
    }

    return (
        <main className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(99,102,241,0.2),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(6,182,212,0.12),transparent_30%)]" />
            <section className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
                <div className="hidden flex-col justify-between bg-indigo-600 p-10 lg:flex">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-100">Convo</span>
                        <h1 className="mt-20 max-w-sm text-5xl font-semibold leading-tight tracking-tight text-white">Your AI assistant, ready when you are.</h1>
                    </div>
                    <p className="max-w-xs text-sm leading-6 text-indigo-100">Think, create, and get things done with an AI companion built for you.</p>
                </div>

                <div className="p-7 sm:p-12">
                    <div className="mb-10 lg:hidden">
                        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Convo</span>
                    </div>
                    <div className="mb-8">
                        <p className="mb-3 text-sm font-medium text-cyan-300">Welcome back</p>
                        <h2 className="text-3xl font-semibold tracking-tight text-white">Sign in to your account</h2>
                        <p className="mt-3 text-sm text-slate-400">Pick up where you left off.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="login-email">Email address</label>
                            <input
                                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
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
                                <label className="block text-sm font-medium text-slate-200" htmlFor="login-password">Password</label>
                                <button className="text-xs font-medium text-cyan-300 transition hover:text-cyan-200" type="button">Forgot password?</button>
                            </div>
                            <input
                                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                                id="login-password"
                                name="password"
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                type="password"
                                value={formData.password}
                            />
                        </div>
                        <button className="w-full rounded-xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900" type="submit">Sign in</button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-400">New to Convo? <Link className="font-semibold text-cyan-300 hover:text-cyan-200" to="/register">Create an account</Link></p>
                </div>
            </section>
        </main>
    )
}

export default Login