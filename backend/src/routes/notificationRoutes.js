import { Router } from 'express'
import { getPushConfig, subscribeToPush } from '../controllers/notificationController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
router.get('/push-config', getPushConfig)
router.post('/push-subscriptions', requireAuth, requireAdmin, subscribeToPush)
export default router
