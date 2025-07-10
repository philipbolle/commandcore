import { logger } from '../utils/logger'

export interface ProductMetrics {
  productId: string
  visitors: number
  conversions: number
  revenue: number
  churnRate: number
  userFeedback: string[]
  lastUpdated: Date
}

export interface ProductAnalytics {
  productId: string
  metrics: ProductMetrics
  recommendations: string[]
  shouldIterate: boolean
  iterationReason?: string
}

export class FeedbackService {
  private metrics: Map<string, ProductMetrics> = new Map()

  async trackMetrics(productId: string, metrics: Partial<ProductMetrics>): Promise<void> {
    try {
      const existing = this.metrics.get(productId)
      
      const updatedMetrics: ProductMetrics = {
        productId,
        visitors: metrics.visitors || existing?.visitors || 0,
        conversions: metrics.conversions || existing?.conversions || 0,
        revenue: metrics.revenue || existing?.revenue || 0,
        churnRate: metrics.churnRate || existing?.churnRate || 0,
        userFeedback: metrics.userFeedback || existing?.userFeedback || [],
        lastUpdated: new Date()
      }
      
      this.metrics.set(productId, updatedMetrics)
      
      logger.info(`Tracked metrics for ${productId}`)
    } catch (error) {
      logger.error('Error tracking metrics:', error)
      throw error
    }
  }

  async getProductAnalytics(productId: string): Promise<ProductAnalytics> {
    try {
      const metrics = this.metrics.get(productId)
      
      if (!metrics) {
        throw new Error(`No metrics found for product ${productId}`)
      }
      
      // Analyze performance and generate recommendations
      const recommendations: string[] = []
      let shouldIterate = false
      let iterationReason: string | undefined
      
      if (metrics.conversions < 10) {
        recommendations.push('Low conversion rate - consider improving landing page')
        shouldIterate = true
        iterationReason = 'Low conversions'
      }
      
      if (metrics.churnRate > 0.1) {
        recommendations.push('High churn rate - focus on user retention')
        shouldIterate = true
        iterationReason = 'High churn'
      }
      
      if (metrics.revenue < 100) {
        recommendations.push('Low revenue - consider pricing strategy')
        shouldIterate = true
        iterationReason = 'Low revenue'
      }
      
      return {
        productId,
        metrics,
        recommendations,
        shouldIterate,
        iterationReason
      }
    } catch (error) {
      logger.error('Error getting product analytics:', error)
      throw error
    }
  }

  async triggerIteration(productId: string): Promise<{ success: boolean; message: string }> {
    try {
      const analytics = await this.getProductAnalytics(productId)
      
      if (!analytics.shouldIterate) {
        return {
          success: false,
          message: 'Product performing well, no iteration needed'
        }
      }
      
      // In production, this would:
      // 1. Analyze user feedback
      // 2. Generate improvement suggestions
      // 3. Update product features
      // 4. Redeploy with improvements
      
      logger.info(`Triggering iteration for ${productId}: ${analytics.iterationReason}`)
      
      return {
        success: true,
        message: `Iteration triggered for ${productId} due to ${analytics.iterationReason}`
      }
    } catch (error) {
      logger.error('Error triggering iteration:', error)
      throw error
    }
  }
} 