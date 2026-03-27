import { useNavigate } from 'react-router-dom'
import { Files, Trash2 } from 'lucide-react'
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

export default function SessionCard({ session, onDelete, onDuplicate }) {
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
      className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden group relative"
      onClick={handleOpen}
    >
      {/* Map thumbnail */}
      {session.thumbnail ? (
        <img src={session.thumbnail} alt={name} className="w-full h-20 object-cover" />
      ) : (
        <div className="w-full h-20 relative overflow-hidden">
          <MapLibreMap palette={palette} zoomId="z14" areaType="city-centre" />
          <div className="absolute inset-0 z-10" />
        </div>
      )}

      {/* Dark scrim on hover to make buttons readable */}
      <div className="absolute inset-x-0 top-0 h-20 z-10 bg-black/0 group-hover:bg-black/30 transition-colors pointer-events-none" />

      {/* Hover action buttons */}
      <div
        className="absolute top-2 right-2 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="w-8 h-8 rounded-md bg-white/95 hover:bg-white flex items-center justify-center text-gray-700 hover:text-gray-900 shadow transition-colors"
            title="Duplicate style"
          >
            <Files size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-md bg-white/95 hover:bg-red-500 flex items-center justify-center text-gray-700 hover:text-white shadow transition-colors"
            title="Delete style"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <CardContent className="px-3 py-2">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{session.created_at}</p>
      </CardContent>
    </Card>
  )
}
