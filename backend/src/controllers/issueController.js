import { ObjectId } from 'mongodb'
import { getDb, serializeIssue, toObjectId } from '../lib/mongo.js'
import { notifyAdmins } from '../lib/push.js'
import { idSchema, issueSchema, parseBody, statusSchema } from '../utils/validation.js'

function activeResolvedCutoff() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
}

export async function listIssues(req, res, next) {
  try {
    const filter = req.query.filter || 'All'
    if (!['Open', 'High', 'Reported', 'Assigned', 'Resolved', 'All'].includes(filter)) {
      return res.status(400).json({ error: 'Filter must be Open, High, Reported, Assigned, Resolved, or All.' })
    }
    const query = { $or: [{ status: { $ne: 'Resolved' } }, { status: 'Resolved', resolvedAt: { $gte: activeResolvedCutoff() } }] }
    if (req.user?.role === 'admin' && req.user.adminCategory) query.category = req.user.adminCategory
    if (filter === 'Open') query.status = { $ne: 'Resolved' }
    if (filter === 'High') query.priority = 'High'
    if (['Reported', 'Assigned', 'Resolved'].includes(filter)) query.status = filter
    const issues = await (await getDb()).collection('issues').find(query).sort({ createdAt: -1 }).toArray()
    res.json(issues.map(serializeIssue))
  } catch (error) { next(error) }
}

export async function createIssue(req, res, next) {
  try {
    const data = parseBody(issueSchema, req.body)
    const issue = { ...data, _id: new ObjectId(), reportedById: toObjectId(req.user.id), status: 'Reported', createdAt: new Date(), resolvedAt: null }
    await (await getDb()).collection('issues').insertOne(issue)
    await notifyAdmins(issue)
    res.status(201).json(serializeIssue(issue))
  } catch (error) { next(error) }
}

export async function updateStatus(req, res, next) {
  try {
    const id = parseBody(idSchema, req.params.id)
    const { status } = parseBody(statusSchema, req.body)
    const collection = (await getDb()).collection('issues')
    const issueQuery = { _id: toObjectId(id) }
    if (req.user.adminCategory) issueQuery.category = req.user.adminCategory
    const result = await collection.updateOne(issueQuery, { $set: { status, resolvedAt: status === 'Resolved' ? new Date() : null } })
    if (!result.matchedCount) return res.status(404).json({ error: 'The requested record was not found.' })
    res.json(serializeIssue(await collection.findOne({ _id: toObjectId(id) })))
  } catch (error) { next(error) }
}

export async function uploadPhoto(req, res, next) {
  try {
    const id = parseBody(idSchema, req.params.id)
    if (!req.file) return res.status(400).json({ error: 'An image file is required.' })
    const photoUrl = req.file.path
    const collection = (await getDb()).collection('issues')
    const objectId = toObjectId(id)
    const issueQuery = { _id: objectId }
    if (req.user.role === 'admin' && req.user.adminCategory) issueQuery.category = req.user.adminCategory
    const result = await collection.updateOne(issueQuery, { $set: { photoUrl } })
    if (!result.matchedCount) return res.status(404).json({ error: 'The requested record was not found.' })
    res.json({ photoUrl, issue: serializeIssue(await collection.findOne({ _id: objectId })) })
  } catch (error) { next(error) }
}

export async function listReportAlerts(req, res, next) {
  try {
    const since = new Date(Number(req.query.since) || 0)
    const reports = await (await getDb()).collection('issues')
      .find({ createdAt: { $gt: since }, ...(req.user?.role === 'admin' && req.user.adminCategory ? { category: req.user.adminCategory } : {}) })
      .sort({ createdAt: 1 })
      .limit(25)
      .project({ title: 1, notifyBuzzer: 1, createdAt: 1 })
      .toArray()
    res.json(reports.map((report) => ({
      id: report._id.toString(),
      title: report.title,
      notifyBuzzer: Boolean(report.notifyBuzzer),
      createdAt: report.createdAt
    })))
  } catch (error) { next(error) }
}

export async function resolveOwnIssue(req, res, next) {
  try {
    const id = parseBody(idSchema, req.params.id)
    const collection = (await getDb()).collection('issues')
    const objectId = toObjectId(id)
    const result = await collection.updateOne(
      { _id: objectId, reportedById: toObjectId(req.user.id), status: { $ne: 'Resolved' } },
      { $set: { status: 'Resolved', resolvedAt: new Date() } }
    )
    if (!result.matchedCount) return res.status(404).json({ error: 'Only the student who reported this issue can resolve it.' })
    res.json(serializeIssue(await collection.findOne({ _id: objectId })))
  } catch (error) { next(error) }
}