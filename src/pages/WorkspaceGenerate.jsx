// 1.2 — Workspace: Input & Generate
// Spec: C-UX-Scenarios/01-mias-style-sprint/1.2-workspace-generate/1.2-workspace-generate.md
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkspaceLayout from '@/components/WorkspaceLayout'
import ChatBubble from '@/components/ChatBubble'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLang } from '@/context/LangContext'

export default function WorkspaceGenerate() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [userPrompt, setUserPrompt] = useState('')
  const textareaRef = useRef(null)

  const handleGenerate = () => {
    if (!input.trim() || generating) return
    console.log('[WorkspaceGenerate] generating with prompt:', input)
    setUserPrompt(input)
    setInput('')
    setGenerating(true)
    setTimeout(() => {
      navigate('/workspace/preview', { state: { userPrompt: input } })
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const chatContent = (
    <div id="workspace-chat-history">
      {!userPrompt && !generating && (
        <p className="text-sm text-muted-foreground">
          {t('chat_empty_state')}
        </p>
      )}
      {userPrompt && (
        <ChatBubble role="user">{userPrompt}</ChatBubble>
      )}
      {generating && (
        <ChatBubble role="ai" id="workspace-generating-indicator">
          {t('generating_msg')}
        </ChatBubble>
      )}
    </div>
  )

  const inputZone = (
    <div className="flex flex-col gap-2">
      <Textarea
        id="workspace-input-field"
        ref={textareaRef}
        placeholder={t('input_placeholder')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={generating}
        className="resize-none text-sm min-h-[80px]"
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          id="workspace-generate-btn"
          onClick={handleGenerate}
          disabled={!input.trim() || generating}
        >
          {t('generate_btn')}
        </Button>
      </div>
    </div>
  )

  const mapPanel = generating ? (
    <div
      id="workspace-preview-loading"
      className="flex-1 bg-map-bg animate-pulse-slow flex items-center justify-center"
    >
      <span className="text-xs opacity-40" style={{ color: 'var(--map-label)' }}>
        {t('generating_msg')}
      </span>
    </div>
  ) : null

  return (
    <WorkspaceLayout
      chatContent={chatContent}
      inputZone={inputZone}
      mapPanel={mapPanel}
    />
  )
}
