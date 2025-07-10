import { Router } from 'express'
import { logger } from '../utils/logger'
import { ProductService } from '../services/productService'

const router = Router()
const productService = new ProductService()

// Generate MVP from idea
router.post('/generate', async (req, res) => {
  try {
    const { ideaId, features } = req.body
    const product = await productService.generateMVP(ideaId, features)
    res.json({ success: true, data: product })
  } catch (error) {
    logger.error('Error generating product:', error)
    res.status(500).json({ success: false, error: 'Failed to generate product' })
  }
})

// Get product status
router.get('/:productId/status', async (req, res) => {
  try {
    const { productId } = req.params
    const status = await productService.getProductStatus(productId)
    res.json({ success: true, data: status })
  } catch (error) {
    logger.error('Error getting product status:', error)
    res.status(500).json({ success: false, error: 'Failed to get product status' })
  }
})

export { router as productRouter } 