import { MongoClient, ObjectId } from 'mongodb'

const client = new MongoClient(process.env.DATABASE_URL)
let databasePromise

export function getDb() {
  if (!databasePromise) {
    databasePromise = client.connect().then(async (connection) => {
      const database = connection.db()
      await Promise.all([
        database.collection('users').createIndex({ email: 1 }, { unique: true }),
        database.collection('issues').createIndex({ status: 1, resolvedAt: 1 }),
        database.collection('donations').createIndex({ createdAt: -1 })
      ])
      return database
    })
  }
  return databasePromise
}

export function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const error = new Error('Invalid id.')
    error.statusCode = 400
    throw error
  }
  return new ObjectId(id)
}

export function serializeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    adminCategory: user.adminCategory || null,
    createdAt: user.createdAt
  }
}

export function serializeIssue(issue) {
  return {
    id: issue._id.toString(),
    title: issue.title,
    category: issue.category,
    location: issue.location,
    priority: issue.priority,
    description: issue.description,
    notifyBuzzer: Boolean(issue.notifyBuzzer),
    status: issue.status,
    photoUrl: issue.photoUrl || null,
    createdAt: issue.createdAt,
    resolvedAt: issue.resolvedAt || null,
    reportedById: issue.reportedById.toString()
  }
}