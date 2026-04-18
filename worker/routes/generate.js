import { Hono } from 'hono'
import Anthropic from '@anthropic-ai/sdk'
import { buildGeneratePrompt, buildRefinePrompt, buildLayerMapFromSchema } from '../../server/prompts/palette.js'
import { analyzeStyle } from '../../server/lib/analyzeStyle.js'

const app = new Hono()

function parsePaletteResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  return JSON.parse(cleaned)
}

// POST /api/generate
app.post('/generate', async (c) => {
  const { prompt, styleUrl } = await c.req.json()
  if (!prompt?.trim()) return c.json({ error: 'prompt is required' }, 400)

  let schema = null
  let layerMap = null
  let baseStyleUrl = null

  if (styleUrl?.trim()) {
    try {
      const result = await analyzeStyle(styleUrl.trim())
      schema = result.schema
      layerMap = result.layerMap
      baseStyleUrl = styleUrl.trim()
    } catch (err) {
      console.error('analyzeStyle error:', err)
      return c.json({ error: `Failed to analyze style URL: ${err.message}` }, 400)
    }
  }

  const client = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY })
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildGeneratePrompt(prompt, layerMap, schema) }],
    })
    const palette = parsePaletteResponse(message.content[0].text)
    const response = { palette }
    if (schema) response.schema = schema
    if (baseStyleUrl) response.baseStyleUrl = baseStyleUrl
    return c.json(response)
  } catch (err) {
    console.error('POST /api/generate error:', err)
    return c.json({ error: `Failed to generate palette: ${err.message}` }, 500)
  }
})

// POST /api/refine
app.post('/refine', async (c) => {
  const { prompt, currentPalette, refinementPrompt, schema, layerMap } = await c.req.json()
  if (!refinementPrompt?.trim()) return c.json({ error: 'refinementPrompt is required' }, 400)

  const resolvedLayerMap = layerMap ?? (schema ? buildLayerMapFromSchema(schema) : null)

  const client = new Anthropic({ apiKey: c.env.ANTHROPIC_API_KEY })
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildRefinePrompt(prompt, currentPalette, refinementPrompt, resolvedLayerMap, schema ?? null) }],
    })
    const palette = parsePaletteResponse(message.content[0].text)
    return c.json({ palette })
  } catch (err) {
    console.error('POST /api/refine error:', err)
    return c.json({ error: `Failed to refine palette: ${err.message}` }, 500)
  }
})

export default app
