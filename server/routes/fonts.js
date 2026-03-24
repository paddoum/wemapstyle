import { Router } from 'express'
import { createReadStream, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FONTS_DIR = join(__dirname, '..', 'fonts')

const router = Router()

// GET /fonts/:fontstack/:range.pbf
// Serves local PBF if the font folder exists, otherwise proxies to OpenMapTiles.
router.get('/:fontstack/:range', async (req, res) => {
  const { fontstack, range } = req.params
  const localFile = join(FONTS_DIR, fontstack, range)

  if (existsSync(localFile)) {
    res.setHeader('Content-Type', 'application/x-protobuf')
    createReadStream(localFile).pipe(res)
    return
  }

  // Proxy to OpenMapTiles for fonts we don't host locally
  try {
    const url = `https://fonts.openmaptiles.org/${encodeURIComponent(fontstack)}/${range}`
    const upstream = await fetch(url)
    if (!upstream.ok) { res.status(upstream.status).end(); return }
    res.setHeader('Content-Type', 'application/x-protobuf')
    const buf = await upstream.arrayBuffer()
    res.send(Buffer.from(buf))
  } catch {
    res.status(502).end()
  }
})

export default router
