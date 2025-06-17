import dotenv from 'dotenv'
import app from './app.js'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔄 Price matching API: http://localhost:${PORT}/api/price-matching`)
})

// Email and status watchers are no longer used

