import dotenv from 'dotenv'
import app from './app.js'

// Load environment variables
dotenv.config()

const PORT = process.env.PORT || 3001

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}`)
  console.log(`🔐 Authentication: MongoDB + JWT`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

// Email and status watchers are no longer used

