import { Router } from 'express'
import { createDonation, getTotal } from '../controllers/donationController.js'

const router = Router()
router.get('/total', getTotal)
router.post('/', createDonation)
export default router