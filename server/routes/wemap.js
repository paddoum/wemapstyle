import { Router } from 'express'

const router = Router()

async function getWemapToken(clientId, username, password) {
  const body = new FormData()
  body.append('client_id', clientId)
  body.append('grant_type', 'password')
  body.append('username', username)
  body.append('password', password)

  const res = await fetch('https://api.getwemap.com/v3.0/oauth2/token/', {
    method: 'POST',
    body,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Wemap auth failed (${res.status}): ${detail}`)
  }
  const { access_token } = await res.json()
  return access_token
}

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username and password are required' })

  const clientId = process.env.WEMAP_PASSWORD_CLIENT_ID
  if (!clientId) return res.status(500).json({ error: 'Wemap client not configured' })

  try {
    const token = await getWemapToken(clientId, username, password)
    res.json({ token })
  } catch (err) {
    console.error('Wemap login error:', err.message)
    res.status(401).json({ error: err.message })
  }
})

// POST /api/push-to-wemap
router.post('/push-to-wemap', async (req, res) => {
  const { sessionId, name, styleJson, token } = req.body
  if (!name || !styleJson) return res.status(400).json({ error: 'name and styleJson are required' })
  if (!token) return res.status(400).json({ error: 'auth token is required' })

  const content = btoa(styleJson)
  const body = JSON.stringify({
    name,
    type: 'style',
    content_file: { content, name: 'style.json', type: 'application/json' },
  })

  const assetRes = await fetch('https://api.getwemap.com/v3.0/assets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!assetRes.ok) {
    const detail = await assetRes.text().catch(() => '')
    console.error('Wemap asset push failed:', assetRes.status, detail)
    return res.status(502).json({ error: `Wemap asset push failed (${assetRes.status}): ${detail}` })
  }

  const asset = await assetRes.json()
  res.json({ asset, updated: false })
})

export default router
