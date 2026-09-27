import webpush from 'web-push'
import { ObjectId } from 'mongodb'
import { getDb } from './mongo.js'

const publicKey = process.env.VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY
const subject = process.env.VAPID_SUBJECT || 'mailto:campusfix@example.com'

if (publicKey && privateKey) webpush.setVapidDetails(subject, publicKey, privateKey)

export function getPublicKey() {
  return publicKey || null
}

export async function saveSubscription(userId, subscription) {
  const database = await getDb()
  await database.collection('pushSubscriptions').updateOne(
    { userId, 'subscription.endpoint': subscription.endpoint },
    { $set: { userId, subscription, updatedAt: new Date() } },
    { upsert: true }
  )
}

export async function notifyAdmins(report) {
  if (!publicKey || !privateKey) return
  const database = await getDb()
  const subscriptions = await database.collection('pushSubscriptions').find({}).toArray()
  const userIds = subscriptions
    .map(({ userId }) => ObjectId.isValid(userId) ? new ObjectId(userId) : null)
    .filter(Boolean)
  const admins = await database.collection('users').find({ _id: { $in: userIds }, role: 'admin' }).project({ adminCategory: 1 }).toArray()
  const adminCategories = new Map(admins.map((admin) => [admin._id.toString(), admin.adminCategory || null]))
  const relevantSubscriptions = subscriptions.filter(({ userId }) => {
    const category = adminCategories.get(userId)
    return category === null || category === report.category
  })
  const payload = JSON.stringify({
    title: 'New CampusFix report',
    body: report.title,
    id: report._id?.toString(),
    notifyBuzzer: Boolean(report.notifyBuzzer)
  })

  await Promise.all(relevantSubscriptions.map(async ({ _id, subscription }) => {
    try {
      await webpush.sendNotification(subscription, payload, {
        TTL: 60,
        urgency: report.notifyBuzzer ? 'high' : 'normal'
      })
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await database.collection('pushSubscriptions').deleteOne({ _id })
      }
    }
  }))
}
