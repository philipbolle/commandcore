import dotenv from 'dotenv'
dotenv.config()
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY)

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { logger } from './utils/logger'
import { ideaRouter } from './routes/idea'
import { agentRouter } from './routes/agent'
import { productRouter } from './routes/product'
import { deployRouter } from './routes/deploy'
import { marketRouter } from './routes/market'
import { feedbackRouter } from './routes/feedback'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/ideas', ideaRouter)
app.use('/api/agents', agentRouter)
app.use('/api/products', productRouter)
app.use('/api/deploy', deployRouter)
app.use('/api/market', marketRouter)
app.use('/api/feedback', feedbackRouter)

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  logger.info(`🚀 CommandCore API running on port ${PORT}`)
}) 