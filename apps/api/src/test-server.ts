import express from 'express'

const app = express()
const PORT = 3001

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/test', (req, res) => {
  res.json({ message: 'CommandCore API is working!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`)
}) 