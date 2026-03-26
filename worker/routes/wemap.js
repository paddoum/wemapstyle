import { Hono } from 'hono'

const app = new Hono()

async function getWemapToken(clientId, clientSecret) {
  const res = await fetch('https://api.getwemap.com/v3.0/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Wemap auth failed (${res.status}): ${detail}`)
  }
  const { access_token } = await res.json()
  return access_token
}

// POST /api/push-to-wemap
// Creates a new Wemap asset, or updates the existing one if the session
// already has a wemap_asset_id. Credentials never leave the Worker.
app.post('/push-to-wemap', async (c) => {
  const { sessionId, name, styleJson } = await c.req.json()
  if (!name || !styleJson) return c.json({ error: 'name and styleJson are required' }, 400)

  const clientId = c.env.WEMAP_CLIENT_ID
  const clientSecret = c.env.WEMAP_CLIENT_SECRET
  if (!clientId || !clientSecret) return c.json({ error: 'Wemap credentials not configured' }, 500)

  // Use a pre-issued user token if available, otherwise exchange client credentials
  let token = c.env.WEMAP_USER_TOKEN || null
  if (!token) {
    try {
      token = await getWemapToken(clientId, clientSecret)
    } catch (err) {
      console.error('Wemap auth error:', err)
      return c.json({ error: err.message }, 502)
    }
  }

  const content = btoa(styleJson)
  const body = JSON.stringify({
    name,
    type: 'style',
    content_file: { content, name: 'style.json', type: 'application/json' },
  })

  // Look up existing asset ID for this session
  let existingAssetId = null
  if (sessionId && c.env.DB) {
    const row = await c.env.DB.prepare(
      'SELECT wemap_asset_id FROM sessions WHERE id = ?'
    ).bind(sessionId).first()
    existingAssetId = row?.wemap_asset_id ?? null
  }

  const isUpdate = Boolean(existingAssetId)
  const url = isUpdate
    ? `https://api.getwemap.com/v3.0/assets/${existingAssetId}`
    : 'https://api.getwemap.com/v3.0/assets'

  const assetRes = await fetch(url, {
    method: isUpdate ? 'PUT' : 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!assetRes.ok) {
    const detail = await assetRes.text().catch(() => '')
    console.error('Wemap asset push failed:', assetRes.status, detail)
    return c.json({ error: `Wemap asset push failed (${assetRes.status}): ${detail}` }, 502)
  }

  const asset = await assetRes.json()

  // On first push, save the asset ID back to the session
  if (!isUpdate && sessionId && c.env.DB && asset.id) {
    await c.env.DB.prepare(
      "UPDATE sessions SET wemap_asset_id = ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(String(asset.id), sessionId).run()
  }

  return c.json({ asset, updated: isUpdate })
})

export default app
