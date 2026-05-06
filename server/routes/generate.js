import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { buildGenerateMessages, buildRefineMessages, buildLayerMapFromSchema } from '../prompts/palette.js'
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
    const { system, messages } = buildGenerateMessages(prompt, layerMap, schema)
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system,
      messages,
    })

    const palette = parsePaletteResponse(message.content[0].text)
    const response = { palette }
    if (schema) response.schema = schema
    if (baseStyleUrl) response.baseStyleUrl = baseStyleUrl

    res.json(response)
  } catch (err) {
    console.error('POST /api/generate error:', err)
    res.status(500).json({ error: `Failed to generate palette: ${err.message}` })
  }
})

// POST /api/refine — refine palette, streamed via SSE
router.post('/refine', async (req, res) => {
  const { prompt, currentPalette, refinementPrompt, schema, layerMap } = req.body
  if (!refinementPrompt?.trim()) return res.status(400).json({ error: 'refinementPrompt is required' })

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const resolvedLayerMap = layerMap ?? (schema ? buildLayerMapFromSchema(schema) : null)

  try {
    const { system, messages } = buildRefineMessages(prompt, currentPalette, refinementPrompt, resolvedLayerMap, schema ?? null)

    let fullText = ''
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system,
      messages,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        fullText += event.delta.text
        res.write(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`)
      }
    }

    const palette = parsePaletteResponse(fullText)
    res.write(`data: ${JSON.stringify({ done: true, palette })}\n\n`)
  } catch (err) {
    console.error('POST /api/refine error:', err)
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
  } finally {
    res.end()
  }
})

export default router
