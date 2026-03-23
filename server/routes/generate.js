import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { buildGeneratePrompt, buildRefinePrompt } from '../prompts/palette.js'

const router = Router()
const client = new Anthropic()

function parsePaletteResponse(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  return JSON.parse(cleaned)
}

// POST /api/generate — generate palette from prompt
router.post('/generate', async (req, res) => {
  const { prompt } = req.body
  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt is required' })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildGeneratePrompt(prompt) }],
    })

    const text = message.content[0].text
    const palette = parsePaletteResponse(text)

    res.json({ palette })
  } catch (err) {
    console.error('POST /api/generate error:', err)
    res.status(500).json({ error: 'Failed to generate palette' })
  }
})

// POST /api/refine — refine palette from follow-up prompt
router.post('/refine', async (req, res) => {
  const { prompt, currentPalette, refinementPrompt } = req.body
  if (!refinementPrompt?.trim()) return res.status(400).json({ error: 'refinementPrompt is required' })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildRefinePrompt(prompt, currentPalette, refinementPrompt) }],
    })

    const text = message.content[0].text
    const palette = parsePaletteResponse(text)

    res.json({ palette })
  } catch (err) {
    console.error('POST /api/refine error:', err)
    res.status(500).json({ error: 'Failed to refine palette' })
  }
})

export default router
