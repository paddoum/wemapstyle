import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/sessions — list all sessions
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, prompt, palette, thumbnail, style_schema, base_style_url, created_at, updated_at FROM sessions ORDER BY updated_at DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /api/sessions error:', err)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// POST /api/sessions — create session
router.post('/', async (req, res) => {
  const { name, prompt, palette, thumbnail, style_schema, base_style_url } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  try {
    const { rows } = await pool.query(
      `INSERT INTO sessions (name, prompt, palette, thumbnail, style_schema, base_style_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, prompt, palette, thumbnail, style_schema, base_style_url, created_at, updated_at`,
      [name, prompt ?? null, palette ? JSON.stringify(palette) : null, thumbnail ?? null,
       style_schema ? JSON.stringify(style_schema) : null, base_style_url ?? null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('POST /api/sessions error:', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// PATCH /api/sessions/:id — update name, palette, thumbnail, schema, or base_style_url
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { name, palette, thumbnail, style_schema, base_style_url } = req.body

  try {
    const { rows } = await pool.query(
      `UPDATE sessions
       SET name = COALESCE($1, name),
           palette = COALESCE($2::jsonb, palette),
           thumbnail = COALESCE($3, thumbnail),
           style_schema = COALESCE($5::jsonb, style_schema),
           base_style_url = COALESCE($6, base_style_url),
           updated_at = now()
       WHERE id = $4
       RETURNING id, name, prompt, palette, thumbnail, style_schema, base_style_url, created_at, updated_at`,
      [name ?? null, palette ? JSON.stringify(palette) : null, thumbnail ?? null, id,
       style_schema ? JSON.stringify(style_schema) : null, base_style_url ?? null]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('PATCH /api/sessions/:id error:', err)
    res.status(500).json({ error: 'Failed to update session' })
  }
})

// DELETE /api/sessions/:id — delete session
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const { rowCount } = await pool.query('DELETE FROM sessions WHERE id = $1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'Session not found' })
    res.status(204).end()
  } catch (err) {
    console.error('DELETE /api/sessions/:id error:', err)
    res.status(500).json({ error: 'Failed to delete session' })
  }
})

export default router
