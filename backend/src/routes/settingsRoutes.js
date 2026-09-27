import { Router } from 'express'
import { getHelpline, updateHelpline } from '../controllers/settingsController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
router.get('/helpline', getHelpline)
router.put('/helpline', requireAuth, requireAdmin, updateHelpline)
export default router