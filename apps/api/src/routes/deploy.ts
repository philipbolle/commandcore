import { Router } from 'express'
import { logger } from '../utils/logger'
import { DeployService } from '../services/deployService'

const router = Router()
const deployService = new DeployService()

// Deploy product to Vercel
router.post('/vercel', async (req, res) => {
  try {
    const { productId, repoUrl } = req.body
    const deployment = await deployService.deployToVercel(productId, repoUrl)
    res.json({ success: true, data: deployment })
  } catch (error) {
    logger.error('Error deploying to Vercel:', error)
    res.status(500).json({ success: false, error: 'Failed to deploy to Vercel' })
  }
})

// Get deployment status
router.get('/status/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params
    const status = await deployService.getDeploymentStatus(deploymentId)
    res.json({ success: true, data: status })
  } catch (error) {
    logger.error('Error getting deployment status:', error)
    res.status(500).json({ success: false, error: 'Failed to get deployment status' })
  }
})

export { router as deployRouter } 