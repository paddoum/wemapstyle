import { Hono } from 'hono'

const app = new Hono()

// GET /api/sessions
app.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, prompt, palette, thumbnail, created_at, updated_at FROM sessions ORDER BY updated_at DESC'
    ).all()
    // Parse palette JSON for each row
    const rows = results.map(r => ({ ...r, palette: r.palette ? JSON.parse(r.palette) : null }))
    return c.json(rows)
  } catch (err) {
    console.error('GET /api/sessions error:', err)
    return c.json({ error: 'Failed to fetch sessions' }, 500)
  }
})

// POST /api/sessions
app.post('/', async (c) => {
  const { name, prompt, palette, thumbnail } = await c.req.json()
  if (!name) return c.json({ error: 'name is required' }, 400)

  try {
    const { meta } = await c.env.DB.prepare(
      'INSERT INTO sessions (name, prompt, palette, thumbnail) VALUES (?, ?, ?, ?)'
    ).bind(name, prompt ?? null, palette ? JSON.stringify(palette) : null, thumbnail ?? null).run()

    const row = await c.env.DB.prepare(
      'SELECT id, name, prompt, palette, thumbnail, created_at, updated_at FROM sessions WHERE id = ?'
    ).bind(meta.last_row_id).first()

    return c.json({ ...row, palette: row.palette ? JSON.parse(row.palette) : null }, 201)
  } catch (err) {
    console.error('POST /api/sessions error:', err)
    return c.json({ error: 'Failed to create session' }, 500)
  }
})

// PATCH /api/sessions/:id
app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const { name, palette, thumbnail } = await c.req.json()

  try {
    await c.env.DB.prepare(
      `UPDATE sessions
       SET name      = COALESCE(?, name),
           palette   = COALESCE(?, palette),
           thumbnail = COALESCE(?, thumbnail),
           updated_at = datetime('now')
       WHERE id = ?`
    ).bind(name ?? null, palette ? JSON.stringify(palette) : null, thumbnail ?? null, id).run()

    const row = await c.env.DB.prepare(
      'SELECT id, name, prompt, palette, thumbnail, created_at, updated_at FROM sessions WHERE id = ?'
    ).bind(id).first()

    if (!row) return c.json({ error: 'Session not found' }, 404)
    return c.json({ ...row, palette: row.palette ? JSON.parse(row.palette) : null })
  } catch (err) {
    console.error('PATCH /api/sessions/:id error:', err)
    return c.json({ error: 'Failed to update session' }, 500)
  }
})

// DELETE /api/sessions/:id
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const { meta } = await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run()
    if (meta.changes === 0) return c.json({ error: 'Session not found' }, 404)
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error('DELETE /api/sessions/:id error:', err)
    return c.json({ error: 'Failed to delete session' }, 500)
  }
})

export default app
