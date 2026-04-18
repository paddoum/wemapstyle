import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { buildGeneratePrompt, buildRefinePrompt, buildLayerMapFromSchema } from '../prompts/palette.js'
import { analyzeStyle } from '../lib/analyzeStyle.js'

const router = Router()
const client = new Anthropic()

function parsePaletteResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim()
  return JSON.parse(cleaned)
}

// POST /api/generate — generate palette from prompt
router.post('/generate', async (req, res) => {
  const { prompt, styleUrl } = req.body
  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt is required' })

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
      return res.status(400).json({ error: `Failed to analyze style URL: ${err.message}` })
    }
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildGeneratePrompt(prompt, layerMap, schema) }],
    })

    const text = message.content[0].text
    const palette = parsePaletteResponse(text)

    const response = { palette }
    if (schema) response.schema = schema
    if (baseStyleUrl) response.baseStyleUrl = baseStyleUrl

    res.json(response)
  } catch (err) {
    console.error('POST /api/generate error:', err)
    res.status(500).json({ error: `Failed to generate palette: ${err.message}` })
  }
})

// POST /api/refine — refine palette from follow-up prompt
router.post('/refine', async (req, res) => {
  const { prompt, currentPalette, refinementPrompt, schema, layerMap } = req.body
  if (!refinementPrompt?.trim()) return res.status(400).json({ error: 'refinementPrompt is required' })

  const resolvedLayerMap = layerMap ?? (schema ? buildLayerMapFromSchema(schema) : null)

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildRefinePrompt(prompt, currentPalette, refinementPrompt, resolvedLayerMap, schema ?? null) }],
    })

    const text = message.content[0].text
    const palette = parsePaletteResponse(text)

    res.json({ palette })
  } catch (err) {
    console.error('POST /api/refine error:', err)
    res.status(500).json({ error: `Failed to refine palette: ${err.message}` })
  }
})

export default router
