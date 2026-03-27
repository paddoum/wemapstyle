import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { Button } from '@/components/ui/button'

export default function AppHeader({ onBack, backLabel }) {
  const { t, lang, toggleLang } = useLang()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isHome    = location.pathname === '/'

  const handleBack = onBack ?? (() => navigate('/'))
  const label      = backLabel ?? 'Home'
  const showBack   = onBack != null || !isHome

  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-12 max-w-screen-xl items-center justify-between">

        <div className="flex items-center h-full gap-3">
          <img
            id="home-header-appname"
            src="/logo-wemap.png"
            alt={t('app_name')}
            className="h-full w-auto"
          />
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-xs text-muted-foreground hover:text-foreground px-2 gap-1"
            >
              <ArrowLeft size={14} />
              {label}
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className="text-xs font-medium text-muted-foreground hover:text-foreground mr-6"
        >
          {lang === 'en' ? 'FR' : 'EN'}
        </Button>

      </div>
    </header>
  )
}
