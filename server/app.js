import express from 'express'
import { processMatch } from './processMatch.js'

const app = express()
app.use(express.json({ limit: '10mb' }))

app.post('/match', async (req, res) => {
  const { jobId, fileData } = req.body || {}
  if (!jobId || !fileData) {
    return res.status(400).json({ error: 'Missing jobId or fileData' })
  }
  try {
    await processMatch(jobId, fileData)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default app
