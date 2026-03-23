// 1.3 / 2.3 — Workspace: Preview
// Spec: 1.3-workspace-preview.md, 2.3-workspace-preview.md
import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import ChatBubble from '@/components/ChatBubble'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLang } from '@/context/LangContext'
import { PALETTES, detectPalette } from '@/lib/palettes'

export default function WorkspacePreview() {
  const { t, lang, data, saveSession } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef(null)

  // Use the prompt the user actually typed, or fall back to demo
  const userPrompt = location.state?.userPrompt ?? data.demo_conversation.messages[0].content[lang]

  // Detect palette from what the user typed
  const detectedPalette = detectPalette(userPrompt) ?? PALETTES.warmEarth

  // Select the right AI summary based on palette
  const isCorporate = detectedPalette.id === 'corporate'
  const aiSummary = isCorporate
    ? data.demo_conversation_corporate.ai_summary
    : data.demo_conversation.messages[1]

  const aiHeadline = isCorporate ? aiSummary.headline[lang] : aiSummary.headline[lang]
  const aiBullets  = isCorporate ? aiSummary.bullets[lang]  : aiSummary.bullets[lang]

  const handleRefine = () => {
    if (!input.trim() || submitting) return
    setSubmitting(true)
    setTimeout(() => navigate('/workspace/iteration', {
      state: { userPrompt, refinement: input },
    }), 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleRefine()
    }
  }

  const chatContent = (
    <>
      <ChatBubble role="user">{userPrompt}</ChatBubble>
      <ChatBubble role="ai" id="workspace-ai-style-summary">
        <p className="font-medium mb-1">{aiHeadline}</p>
        <ul className="space-y-0.5 list-disc list-inside">
          {aiBullets.map((b, i) => (
            <li key={i} className="text-xs">{b}</li>
          ))}
        </ul>
      </ChatBubble>
    </>
  )

  const inputZone = (
    <div className="flex flex-col gap-2">
      <Textarea
        id="workspace-input-field"
        ref={textareaRef}
        placeholder={t('refine_placeholder')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={submitting}
        className="resize-none text-sm min-h-[80px]"
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          id="workspace-refine-btn"
          onClick={handleRefine}
          disabled={!input.trim() || submitting}
        >
          {t('refine_btn')}
        </Button>
      </div>
    </div>
  )

  return (
    <WorkspaceLayout
      chatContent={chatContent}
      inputZone={inputZone}
      showMapControls
      palette={detectedPalette}
      onSave={() => saveSession(detectedPalette)}
      onExport={() => navigate('/export')}
    />
  )
}
