import { useLang } from '@/context/LangContext'
import { Button } from '@/components/ui/button'

export default function AppHeader() {
  const { t, lang, toggleLang } = useLang()

  console.log('[AppHeader] lang:', lang)

  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-12 max-w-screen-xl items-center justify-between px-6">
        <span
          id="home-header-appname"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          {t('app_name')}
        </span>
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
