// Area type selector — wired to MapLibreMap via parent state
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLang } from '@/context/LangContext'

export default function AreaTypeTabs({ activeArea, onChange }) {
  const { lang, data } = useLang()

  return (
    <Tabs
      id="workspace-preview-area-type"
      value={activeArea}
      onValueChange={onChange}
    >
      <TabsList className="h-7">
        {data.area_types.map(({ id, label }) => (
          <TabsTrigger key={id} value={id} className="text-xs px-2 py-0.5">
            {label[lang]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
