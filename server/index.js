import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import sessionsRouter from './routes/sessions.js'
import generateRouter from './routes/generate.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/ }))
app.use(express.json())

app.use('/api/sessions', sessionsRouter)
app.use('/api', generateRouter)

app.listen(PORT, () => {
  console.log(`WemapStyle server running on http://localhost:${PORT}`)
})
