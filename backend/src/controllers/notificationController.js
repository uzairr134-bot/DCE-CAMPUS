import { getPublicKey, saveSubscription } from '../lib/push.js'

export function getPushConfig(req, res) {
  res.json({ publicKey: getPublicKey() })
}

export async function subscribeToPush(req, res, next) {
  try {
    if (!getPublicKey()) return res.status(503).json({ error: 'Push notifications are not configured.' })
    await saveSubscription(req.user.id, req.body)
    res.status(201).json({ ok: true })
  } catch (error) {
    next(error)
  }
}
