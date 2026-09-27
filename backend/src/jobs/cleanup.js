import { getDb } from '../lib/mongo.js'

export async function deleteExpiredIssues() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  await (await getDb()).collection('issues').deleteMany({ status: 'Resolved', resolvedAt: { $lt: cutoff } })
}

export function startCleanupJob() {
  const run = () => deleteExpiredIssues().catch((error) => console.error('Issue cleanup failed:', error))
  run()
  return setInterval(run, 60 * 60 * 1000)
}