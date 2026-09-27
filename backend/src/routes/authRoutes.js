import { Router } from 'express'
import { login, signup, updateAdminCategory } from '../controllers/authController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

const router = Router()
router.post('/signup', signup)
router.post('/login', login)
router.patch('/admin-category', requireAuth, requireAdmin, updateAdminCategory)
export default router