import { Router } from 'express'
import { logger } from '../utils/logger'
import { FeedbackService } from '../services/feedbackService'

const router = Router()
const feedbackService = new FeedbackService()

// Track product metrics
router.post('/track', async (req, res) => {
  try {
    const { productId, metrics } = req.body
    const result = await feedbackService.trackMetrics(productId, metrics)
    res.json({ success: true, data: result })
  } catch (error) {
    logger.error('Error tracking metrics:', error)
    res.status(500).json({ success: false, error: 'Failed to track metrics' })
  }
})

// Get product analytics
router.get('/analytics/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const analytics = await feedbackService.getProductAnalytics(productId)
    res.json({ success: true, data: analytics })
  } catch (error) {
    logger.error('Error getting analytics:', error)
    res.status(500).json({ success: false, error: 'Failed to get analytics' })
  }
})

// Trigger product iteration
router.post('/iterate/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const iteration = await feedbackService.triggerIteration(productId)
    res.json({ success: true, data: iteration })
  } catch (error) {
    logger.error('Error triggering iteration:', error)
    res.status(500).json({ success: false, error: 'Failed to trigger iteration' })
  }
})

export { router as feedbackRouter } 