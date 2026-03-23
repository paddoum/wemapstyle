import { createContext, useContext, useState } from 'react'
import data from '../../data/demo-data.json'

const LangContext = createContext()

export function LangProvider({ children }) {
  const [lang, setLang] = useState(data.config.locale)
  const [sessionName, setSessionName] = useState(data.i18n[data.config.locale].session_default_name)
  const [savedSessions, setSavedSessions] = useState([])

  const t = (key) => data.i18n[lang]?.[key] ?? key

  const toggleLang = () => setLang((l) => (l === 'en' ? 'fr' : 'en'))

  const saveSession = (palette) => {
    const today = new Date().toISOString().split('T')[0]
    setSavedSessions(prev => [{
      id: `saved-${Date.now()}`,
      name: sessionName,
      created_at: today,
      thumbnail_bg:    palette.background,
      thumbnail_road:  palette.roadPrimary,
      thumbnail_water: palette.water,
      thumbnail_green: palette.green,
    }, ...prev])
  }

  return (
    <LangContext.Provider value={{
      lang, setLang, toggleLang, t, data,
      sessionName, setSessionName,
      savedSessions, saveSession,
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
