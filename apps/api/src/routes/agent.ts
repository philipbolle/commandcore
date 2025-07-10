import { Router } from 'express'
import { logger } from '../utils/logger'
import { AgentService } from '../services/agentService'

const router = Router()
const agentService = new AgentService()

// Run a specific agent
router.post('/run/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params
    const { input } = req.body
    const result = await agentService.runAgent(agentName, input)
    res.json({ success: true, data: result })
  } catch (error) {
    logger.error('Error running agent:', error)
    res.status(500).json({ success: false, error: 'Failed to run agent' })
  }
})

// Get agent status
router.get('/status/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params
    const status = await agentService.getAgentStatus(agentName)
    res.json({ success: true, data: status })
  } catch (error) {
    logger.error('Error getting agent status:', error)
    res.status(500).json({ success: false, error: 'Failed to get agent status' })
  }
})

// List available agents
router.get('/list', async (req, res) => {
  try {
    const agents = await agentService.listAgents()
    res.json({ success: true, data: agents })
  } catch (error) {
    logger.error('Error listing agents:', error)
    res.status(500).json({ success: false, error: 'Failed to list agents' })
  }
})

export { router as agentRouter } 