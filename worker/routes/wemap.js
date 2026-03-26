import { Hono } from 'hono'

const app = new Hono()

// POST /api/push-to-wemap
// Authenticates with Wemap API using server-side credentials, then uploads
// the style as an asset. Credentials never leave the Worker.
app.post('/push-to-wemap', async (c) => {
  const { name, styleJson } = await c.req.json()
  if (!name || !styleJson) return c.json({ error: 'name and styleJson are required' }, 400)

  const clientId = c.env.WEMAP_CLIENT_ID
  const clientSecret = c.env.WEMAP_CLIENT_SECRET
  if (!clientId || !clientSecret) return c.json({ error: 'Wemap credentials not configured' }, 500)

  // 1. Authenticate
  const tokenRes = await fetch('https://api.getwemap.com/v3.0/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  })
  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    console.error('Wemap auth failed:', err)
    return c.json({ error: 'Wemap authentication failed' }, 502)
  }
  const { access_token } = await tokenRes.json()

  // 2. Push style as base64-encoded asset
  const content = btoa(styleJson)
  const assetRes = await fetch('https://api.getwemap.com/v3.0/assets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      type: 'style',
      content_file: { content, name: 'style.json', type: 'application/json' },
    }),
  })
  if (!assetRes.ok) {
    const err = await assetRes.text()
    console.error('Wemap asset push failed:', err)
    return c.json({ error: 'Failed to push style to Wemap' }, 502)
  }
  const asset = await assetRes.json()
  return c.json({ asset })
})

export default app
