import { Router } from 'express'
import { logger } from '../utils/logger'
import { MarketService } from '../services/marketService'

const router = Router()
const marketService = new MarketService()

// Generate SEO content
router.post('/seo/generate', async (req, res) => {
  try {
    const { productId, keywords } = req.body
    const content = await marketService.generateSEOContent(productId, keywords)
    res.json({ success: true, data: content })
  } catch (error) {
    logger.error('Error generating SEO content:', error)
    res.status(500).json({ success: false, error: 'Failed to generate SEO content' })
  }
})

// Submit to directories
router.post('/directories/submit', async (req, res) => {
  try {
    const { productId, directories } = req.body
    const submissions = await marketService.submitToDirectories(productId, directories)
    res.json({ success: true, data: submissions })
  } catch (error) {
    logger.error('Error submitting to directories:', error)
    res.status(500).json({ success: false, error: 'Failed to submit to directories' })
  }
})

// Generate short-form content
router.post('/shorts/generate', async (req, res) => {
  try {
    const { productId, platform } = req.body
    const content = await marketService.generateShortFormContent(productId, platform)
    res.json({ success: true, data: content })
  } catch (error) {
    logger.error('Error generating short-form content:', error)
    res.status(500).json({ success: false, error: 'Failed to generate short-form content' })
  }
})

export { router as marketRouter } 