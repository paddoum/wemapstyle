import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET /api/sessions — list all sessions
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, prompt, palette, created_at, updated_at FROM sessions ORDER BY updated_at DESC'
    )
    res.json(rows)
  } catch (err) {
    console.error('GET /api/sessions error:', err)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// POST /api/sessions — create session
router.post('/', async (req, res) => {
  const { name, prompt, palette } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  try {
    const { rows } = await pool.query(
      `INSERT INTO sessions (name, prompt, palette)
       VALUES ($1, $2, $3)
       RETURNING id, name, prompt, palette, created_at, updated_at`,
      [name, prompt ?? null, palette ? JSON.stringify(palette) : null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('POST /api/sessions error:', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// PATCH /api/sessions/:id — update name or palette
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { name, palette } = req.body

  try {
    const { rows } = await pool.query(
      `UPDATE sessions
       SET name = COALESCE($1, name),
           palette = COALESCE($2::jsonb, palette),
           updated_at = now()
       WHERE id = $3
       RETURNING id, name, prompt, palette, created_at, updated_at`,
      [name ?? null, palette ? JSON.stringify(palette) : null, id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Session not found' })
    res.json(rows[0])
  } catch (err) {
    console.error('PATCH /api/sessions/:id error:', err)
    res.status(500).json({ error: 'Failed to update session' })
  }
})

export default router
