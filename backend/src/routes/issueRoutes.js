
import { Router } from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import path from 'node:path'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { createIssue, listIssues, listReportAlerts, resolveOwnIssue, updateStatus, uploadPhoto } from '../controllers/issueController.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const upload = multer({
	storage: new CloudinaryStorage({
		cloudinary: cloudinary,
		params: {
			folder: 'campusfix',
			allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
		}
	}),
	limits: { fileSize: 5 * 1024 * 1024 }
})

const router = Router()
router.get('/', requireAuth, listIssues)
router.get('/alerts', requireAuth, listReportAlerts)
router.post('/', requireAuth, createIssue)
router.patch('/:id/status', requireAuth, requireAdmin, updateStatus)
router.patch('/:id/resolve', requireAuth, resolveOwnIssue)
router.post('/:id/photo', requireAuth, upload.single('photo'), uploadPhoto)
export default router