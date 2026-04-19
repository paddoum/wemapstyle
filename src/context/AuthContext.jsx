import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext()
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'
const STORAGE_KEY = 'wemapstyle_auth'

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? 'Login failed')
    }
    const { token } = await res.json()
    const value = { token, username }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    setAuth(value)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
