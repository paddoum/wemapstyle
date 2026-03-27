import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '@/context/LangContext'
import { Button } from '@/components/ui/button'

export default function AppHeader() {
  const { t, lang, toggleLang } = useLang()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isHome    = location.pathname === '/'

  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-12 max-w-screen-xl items-center justify-between px-6">

        <div className="flex items-center gap-3">
          {!isHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs text-muted-foreground hover:text-foreground px-2 gap-1"
            >
              <ArrowLeft size={14} />
              Home
            </Button>
          )}
          <span
            id="home-header-appname"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            {t('app_name')}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          {lang === 'en' ? 'FR' : 'EN'}
        </Button>

      </div>
    </header>
  )
}
