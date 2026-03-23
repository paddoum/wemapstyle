import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { useLang } from '@/context/LangContext'
import MapLibreMap from '@/components/MapLibreMap'

function derivePalette(session) {
  return {
    background:  session.thumbnail_bg    ?? '#efebe6',
    water:       session.thumbnail_water ?? '#89b4cc',
    green:       session.thumbnail_green ?? '#a8c99a',
    roadPrimary: session.thumbnail_road  ?? '#e0d8ce',
    roadCasing:  session.thumbnail_road  ?? '#c8b9aa',
    roadMinor:   session.thumbnail_road  ?? '#ede8e2',
    waterLabel:  session.thumbnail_water ?? '#4a7a9b',
  }
}


export default function SessionCard({ session }) {
  const { lang } = useLang()
  const navigate = useNavigate()

  const name    = typeof session.name === 'object' ? session.name[lang] : session.name
  const palette = session.palette ?? derivePalette(session)

  const handleOpen = () => {
    navigate('/workspace/iteration', {
      state: {
        fromSaved:   true,
        sessionId:   session.id,
        sessionName: name,
        userPrompt:  session.prompt ?? name,
        palette,
      },
    })
  }

  return (
    <Card
      id="home-recent-session-card"
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
      onClick={handleOpen}
    >
      {session.thumbnail ? (
        <img
          src={session.thumbnail}
          alt={name}
          className="w-full h-20 object-cover"
        />
      ) : (
        <div className="w-full h-20 relative overflow-hidden">
          <MapLibreMap palette={palette} zoomId="z14" areaType="city-centre" />
          <div className="absolute inset-0 z-10" />
        </div>
      )}
      <CardContent className="px-3 py-2">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{session.created_at}</p>
      </CardContent>
    </Card>
  )
}
