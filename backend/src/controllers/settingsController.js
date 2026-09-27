import { getDb } from '../lib/mongo.js'
import { helplineSchema, parseBody } from '../utils/validation.js'

export async function getHelpline(req, res, next) {
  try {
    const collection = (await getDb()).collection('settings')
    await collection.updateOne({ _id: 'settings' }, { $setOnInsert: { helpline: '112', updatedAt: new Date() } }, { upsert: true })
    const settings = await collection.findOne({ _id: 'settings' })
    res.json({ helpline: settings.helpline })
  } catch (error) { next(error) }
}

export async function updateHelpline(req, res, next) {
  try {
    const { helpline } = parseBody(helplineSchema, req.body)
    const collection = (await getDb()).collection('settings')
    await collection.updateOne({ _id: 'settings' }, { $set: { helpline, updatedAt: new Date() } }, { upsert: true })
    const settings = await collection.findOne({ _id: 'settings' })
    res.json({ helpline: settings.helpline })
  } catch (error) { next(error) }
}