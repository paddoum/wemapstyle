import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'
import { buildGeneratePrompt, buildRefinePrompt } from '../../server/prompts/palette.js'

const app = new Hono()

function parsePaletteResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  return JSON.parse(cleaned)
}

// POST /api/generate
app.post('/generate', async (c) => {
  const { prompt } = await c.req.json()
  if (!prompt?.trim()) return c.json({ error: 'prompt is required' }, 400)

  const client = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY })
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildGeneratePrompt(prompt) }],
    })
    const palette = parsePaletteResponse(message.content[0].text)
    return c.json({ palette })
  } catch (err) {
    console.error('POST /api/generate error:', err)
    return c.json({ error: 'Failed to generate palette' }, 500)
  }
})

// POST /api/refine
app.post('/refine', async (c) => {
  const { prompt, currentPalette, refinementPrompt } = await c.req.json()
  if (!refinementPrompt?.trim()) return c.json({ error: 'refinementPrompt is required' }, 400)

  const client = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY })
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildRefinePrompt(prompt, currentPalette, refinementPrompt) }],
    })
    const palette = parsePaletteResponse(message.content[0].text)
    return c.json({ palette })
  } catch (err) {
    console.error('POST /api/refine error:', err)
    return c.json({ error: 'Failed to refine palette' }, 500)
  }
})

export default app
