import { createContext, useContext, useState, useCallback } from 'react'
import data from '../../data/demo-data.json'

const LangContext = createContext()

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001'

export function LangProvider({ children }) {
  const [lang, setLang] = useState(data.config.locale)
  const [sessionName, setSessionName] = useState(data.i18n[data.config.locale].session_default_name)
  const [savedSessions, setSavedSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)

  const t = (key) => data.i18n[lang]?.[key] ?? key

  const toggleLang = () => setLang((l) => (l === 'en' ? 'fr' : 'en'))

  const saveSession = useCallback(async (palette) => {
    const today = new Date().toISOString().split('T')[0]

    // Optimistic in-memory update
    const localSession = {
      id: currentSessionId ?? `saved-${Date.now()}`,
      name: sessionName,
      created_at: today,
      thumbnail_bg:    palette.background,
      thumbnail_road:  palette.roadPrimary,
      thumbnail_water: palette.water,
      thumbnail_green: palette.green,
    }

    if (!currentSessionId) {
      setSavedSessions(prev => [localSession, ...prev])
    } else {
      setSavedSessions(prev => prev.map(s => s.id === currentSessionId ? localSession : s))
    }

    // Persist to API
    try {
      if (!currentSessionId) {
        const res = await fetch(`${API_BASE}/api/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: sessionName, palette }),
        })
        if (res.ok) {
          const saved = await res.json()
          setCurrentSessionId(saved.id)
          setSavedSessions(prev => prev.map(s =>
            s.id === localSession.id ? { ...s, id: saved.id } : s
          ))
        }
      } else {
        await fetch(`${API_BASE}/api/sessions/${currentSessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: sessionName, palette }),
        })
      }
    } catch (err) {
      console.error('[LangContext] saveSession API error:', err)
      // In-memory save already done — no user-visible error needed
    }
  }, [sessionName, currentSessionId])

  return (
    <LangContext.Provider value={{
      lang, setLang, toggleLang, t, data,
      sessionName, setSessionName,
      savedSessions, setSavedSessions,
      saveSession,
      currentSessionId, setCurrentSessionId,
    }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within a LangProvider')
  return ctx
}
