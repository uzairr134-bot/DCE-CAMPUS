import { getDb } from '../lib/mongo.js'
import { donationSchema, parseBody } from '../utils/validation.js'

export async function getTotal(req, res, next) {
  try {
    const result = await (await getDb()).collection('donations').aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).toArray()
    res.json({ total: Number(result[0]?.total || 0) })
  } catch (error) { next(error) }
}

export async function createDonation(req, res, next) {
  try {
    const data = parseBody(donationSchema, req.body)
    await (await getDb()).collection('donations').insertOne({ ...data, createdAt: new Date() })
    const result = await (await getDb()).collection('donations').aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).toArray()
    res.status(201).json({ total: Number(result[0]?.total || 0) })
  } catch (error) { next(error) }
}