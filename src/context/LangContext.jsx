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

  const saveSession = useCallback(async (palette, thumbnail = null, styleSchema = null, baseStyleUrl = null) => {
    const today = new Date().toISOString().split('T')[0]

    // Optimistic in-memory update
    const localSession = {
      id: currentSessionId ?? `saved-${Date.now()}`,
      name: sessionName,
      created_at: today,
      palette,
      thumbnail,
      style_schema:   styleSchema,
      base_style_url: baseStyleUrl,
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
          body: JSON.stringify({ name: sessionName, palette, thumbnail, style_schema: styleSchema, base_style_url: baseStyleUrl }),
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
          body: JSON.stringify({ name: sessionName, palette, thumbnail, style_schema: styleSchema, base_style_url: baseStyleUrl }),
        })
      }
    } catch (err) {
      console.error('[LangContext] saveSession API error:', err)
    }
  }, [sessionName, currentSessionId])

  const deleteSession = useCallback(async (id) => {
    // Optimistic remove
    setSavedSessions(prev => prev.filter(s => s.id !== id))
    try {
      const res = await fetch(`${API_BASE}/api/sessions/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 404) throw new Error('Delete failed')
    } catch (err) {
      console.error('[LangContext] deleteSession API error:', err)
      // Rollback — re-fetch from API to restore correct state
      fetch(`${API_BASE}/api/sessions`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(sessions => setSavedSessions(sessions.map(s => ({
          id: s.id, name: s.name,
          created_at: s.created_at?.split('T')[0] ?? '',
          palette: s.palette ?? null,
          thumbnail: s.thumbnail ?? null,
          style_schema: s.style_schema ?? null,
          base_style_url: s.base_style_url ?? null,
          thumbnail_bg:    s.palette?.background  ?? '#efebe6',
          thumbnail_road:  s.palette?.roadPrimary ?? '#e0d8ce',
          thumbnail_water: s.palette?.water       ?? '#89b4cc',
          thumbnail_green: s.palette?.green       ?? '#a8c99a',
        }))))
        .catch(() => {})
    }
  }, [])

  const duplicateSession = useCallback(async (session) => {
    const today    = new Date().toISOString().split('T')[0]
    const name     = `Copy of ${typeof session.name === 'object' ? Object.values(session.name)[0] : session.name}`
    const localId  = `dup-${Date.now()}`
    const newSession = { ...session, id: localId, name, created_at: today }

    // Optimistic prepend
    setSavedSessions(prev => [newSession, ...prev])

    try {
      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          palette: session.palette,
          thumbnail: session.thumbnail,
          style_schema: session.style_schema ?? null,
          base_style_url: session.base_style_url ?? null,
        }),
      })
      if (res.ok) {
        const saved = await res.json()
        setSavedSessions(prev => prev.map(s => s.id === localId ? { ...s, id: saved.id } : s))
      }
    } catch (err) {
      console.error('[LangContext] duplicateSession API error:', err)
    }
  }, [])

  return (
    <LangContext.Provider value={{
      lang, setLang, toggleLang, t, data,
      sessionName, setSessionName,
      savedSessions, setSavedSessions,
      saveSession, deleteSession, duplicateSession,
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
