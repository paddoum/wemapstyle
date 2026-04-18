import { Hono } from 'hono'

const app = new Hono()

// GET /api/sessions
app.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, prompt, palette, thumbnail, wemap_asset_id, style_schema, base_style_url, created_at, updated_at FROM sessions ORDER BY updated_at DESC'
    ).all()
    const rows = results.map(r => ({
      ...r,
      palette: r.palette ? JSON.parse(r.palette) : null,
      style_schema: r.style_schema ? JSON.parse(r.style_schema) : null,
    }))
    return c.json(rows)
  } catch (err) {
    console.error('GET /api/sessions error:', err)
    return c.json({ error: 'Failed to fetch sessions' }, 500)
  }
})

// POST /api/sessions
app.post('/', async (c) => {
  const { name, prompt, palette, thumbnail, style_schema, base_style_url } = await c.req.json()
  if (!name) return c.json({ error: 'name is required' }, 400)

  try {
    const { meta } = await c.env.DB.prepare(
      'INSERT INTO sessions (name, prompt, palette, thumbnail, style_schema, base_style_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      name,
      prompt ?? null,
      palette ? JSON.stringify(palette) : null,
      thumbnail ?? null,
      style_schema ? JSON.stringify(style_schema) : null,
      base_style_url ?? null
    ).run()

    const row = await c.env.DB.prepare(
      'SELECT id, name, prompt, palette, thumbnail, wemap_asset_id, style_schema, base_style_url, created_at, updated_at FROM sessions WHERE id = ?'
    ).bind(meta.last_row_id).first()

    return c.json({
      ...row,
      palette: row.palette ? JSON.parse(row.palette) : null,
      style_schema: row.style_schema ? JSON.parse(row.style_schema) : null,
    }, 201)
  } catch (err) {
    console.error('POST /api/sessions error:', err)
    return c.json({ error: 'Failed to create session' }, 500)
  }
})

// PATCH /api/sessions/:id
app.patch('/:id', async (c) => {
  const id = c.req.param('id')
  const { name, palette, thumbnail, style_schema, base_style_url } = await c.req.json()

  try {
    await c.env.DB.prepare(
      `UPDATE sessions
       SET name           = COALESCE(?, name),
           palette        = COALESCE(?, palette),
           thumbnail      = COALESCE(?, thumbnail),
           style_schema   = COALESCE(?, style_schema),
           base_style_url = COALESCE(?, base_style_url),
           updated_at     = datetime('now')
       WHERE id = ?`
    ).bind(
      name ?? null,
      palette ? JSON.stringify(palette) : null,
      thumbnail ?? null,
      style_schema ? JSON.stringify(style_schema) : null,
      base_style_url ?? null,
      id
    ).run()

    const row = await c.env.DB.prepare(
      'SELECT id, name, prompt, palette, thumbnail, wemap_asset_id, style_schema, base_style_url, created_at, updated_at FROM sessions WHERE id = ?'
    ).bind(id).first()

    if (!row) return c.json({ error: 'Session not found' }, 404)
    return c.json({
      ...row,
      palette: row.palette ? JSON.parse(row.palette) : null,
      style_schema: row.style_schema ? JSON.parse(row.style_schema) : null,
    })
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
