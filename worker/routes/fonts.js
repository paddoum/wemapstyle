import { Hono } from 'hono'

const app = new Hono()

// GET /fonts/:fontstack/:range
// Serves from R2 if the font exists locally, otherwise proxies to OpenMapTiles.
app.get('/:fontstack/:range', async (c) => {
  const fontstack = c.req.param('fontstack')
  const range = c.req.param('range')
  const key = `${fontstack}/${range}`

  // Try R2 first (locally hosted fonts — e.g. Times New Roman)
  const object = await c.env.FONTS_BUCKET.get(key)
  if (object) {
    return new Response(object.body, {
      headers: { 'Content-Type': 'application/x-protobuf' },
    })
  }

  // Proxy to OpenMapTiles for fonts not in R2
  const url = `https://fonts.openmaptiles.org/${encodeURIComponent(fontstack)}/${range}`
  const upstream = await fetch(url)
  if (!upstream.ok) return new Response(null, { status: upstream.status })

  return new Response(upstream.body, {
    headers: { 'Content-Type': 'application/x-protobuf' },
  })
})

export default app
