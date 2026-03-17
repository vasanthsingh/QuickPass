import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState(() => {
        const raw = localStorage.getItem('quickpass_auth')
        return raw ? JSON.parse(raw) : { role: null, token: null, user: null }
    })

    const login = ({ role, token, user }) => {
        const nextState = { role, token, user }
        setAuthState(nextState)
        localStorage.setItem('quickpass_auth', JSON.stringify(nextState))
    }

    const logout = () => {
        const emptyState = { role: null, token: null, user: null }
        setAuthState(emptyState)
        localStorage.removeItem('quickpass_auth')
    }

    const value = useMemo(() => ({ ...authState, login, logout }), [authState])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
