import { useDispatch } from "react-redux";
import { register, login, getMe } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch()

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await register({ email, username, password })
            return data
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await login({ email, password })
            dispatch(setUser(data.user))
            return data
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Login failed"))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            const data = await getMe()
            if (data?.user) {
                dispatch(setUser(data.user))
            } else {
                dispatch(setUser(null))
            }
        } catch (err) {
            dispatch(setUser(null))
            dispatch(setError(err.response?.data?.message || "failed to fetch user"))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
    }
}