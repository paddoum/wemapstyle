import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useLang } from '@/context/LangContext'

function MapThumbnail({ session }) {
  return (
    <div
      className="w-full h-20 rounded-sm overflow-hidden relative"
      style={{ backgroundColor: session.thumbnail_bg }}
    >
      {/* Green patch — parks/landuse */}
      <div
        className="absolute top-2 right-3 w-12 h-8 rounded-sm opacity-80"
        style={{ backgroundColor: session.thumbnail_green }}
      />
      {/* Horizontal road */}
      <div
        className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
        style={{ backgroundColor: session.thumbnail_road }}
      />
      {/* Vertical road */}
      <div
        className="absolute top-0 bottom-8 left-1/3 w-px"
        style={{ backgroundColor: session.thumbnail_road }}
      />
      {/* Water strip — bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-4"
        style={{ backgroundColor: session.thumbnail_water, opacity: 0.75 }}
      />
    </div>
  )
}

export default function SessionCard({ session }) {
  const { lang } = useLang()
  const navigate = useNavigate()

  const name = typeof session.name === 'object' ? session.name[lang] : session.name

  return (
    <Card
      id="home-recent-session-card"
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
      onClick={() => navigate('/workspace/generate')}
    >
      <MapThumbnail session={session} />
      <CardContent className="px-3 py-2">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{session.created_at}</p>
      </CardContent>
    </Card>
  )
}
