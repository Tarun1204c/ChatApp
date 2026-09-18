import { createBrowserRouter } from 'react-router'
import { Link } from 'react-router'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'

const RouteError = () => (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Something went wrong</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">We could not load this page.</h1>
            <Link className="mt-8 inline-block rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300" to="/login">Return to sign in</Link>
        </div>
    </main>
)

const NotFound = () => (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
        <div>
            <p className="text-7xl font-bold text-cyan-400">404</p>
            <h1 className="mt-4 text-3xl font-semibold text-white">Page not found</h1>
            <p className="mt-3 text-sm text-slate-400">The page you are looking for does not exist.</p>
            <Link className="mt-8 inline-block rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300" to="/login">Return to sign in</Link>
        </div>
    </main>
)

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
        errorElement: <RouteError />,
    },
    {
        path: "/login",
        element: <Login />,
        errorElement: <RouteError />,
    },
    {
        path: "/register",
        element: <Register />,
        errorElement: <RouteError />,
    },
    {
        path: "*",
        element: <NotFound />,
    },
])