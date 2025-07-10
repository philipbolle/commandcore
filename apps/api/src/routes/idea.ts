import { Router } from 'express'
import { z } from 'zod'
import { logger } from '../utils/logger'
import { IdeaService } from '../services/ideaService'

const router = Router()
const ideaService = new IdeaService()

const ideaValidationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  targetAudience: z.string().optional(),
  monetizationStrategy: z.string().optional(),
})

// Get trending ideas
router.get('/trending', async (req, res) => {
  try {
    const ideas = await ideaService.getTrendingIdeas()
    res.json({ success: true, data: ideas })
  } catch (error) {
    logger.error('Error fetching trending ideas:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch trending ideas' })
  }
})

// Validate an idea
router.post('/validate', async (req, res) => {
  try {
    const validatedData = ideaValidationSchema.parse(req.body)
    const validation = await ideaService.validateIdea(validatedData)
    res.json({ success: true, data: validation })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Invalid input data', details: error.errors })
    } else {
      logger.error('Error validating idea:', error)
      res.status(500).json({ success: false, error: 'Failed to validate idea' })
    }
  }
})

// Create idea preorder page
router.post('/preorder', async (req, res) => {
  try {
    const { ideaId, email } = req.body
    const preorder = await ideaService.createPreorderPage(ideaId, email)
    res.json({ success: true, data: preorder })
  } catch (error) {
    logger.error('Error creating preorder:', error)
    res.status(500).json({ success: false, error: 'Failed to create preorder' })
  }
})

export { router as ideaRouter } 