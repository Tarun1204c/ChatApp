import { useSelector } from 'react-redux'

const getDisplayName = (user) => {
    if (user?.name) {
        return user.name
    }

    const email = user?.email || 'User'
    const localPart = email.split('@')[0] || 'User'
    const cleanName = localPart.replace(/[._-]+/g, ' ')

    return cleanName
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') || 'User'
}

const Dashboard = () => {
    const user = useSelector((state) => state.auth.user)

    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 px-6 py-10 text-slate-800">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-pink-500">Convo</p>
                    </div>
                    <div className="rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-600 shadow-sm shadow-pink-100">
                        {user ? `Welcome, ${getDisplayName(user)}` : 'Welcome'}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Dashboard
