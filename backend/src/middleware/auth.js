import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) return res.status(401).json({ error: 'Authentication token is required.' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    if (!ObjectId.isValid(req.user.id)) return res.status(401).json({ error: 'Your session is outdated. Please log in again.' })
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access is required.' })
  }
  next()
}