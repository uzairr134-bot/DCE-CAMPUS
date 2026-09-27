export function errorHandler(error, req, res, next) {
  if (error.code === 11000) {
    return res.status(409).json({ error: 'An account with this email already exists.' })
  }
  if (error.code === 'P2025') {
    return res.status(404).json({ error: 'The requested record was not found.' })
  }
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image files must be 1000 MB or smaller.' })
  }
  console.error(error)
  res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Internal server error.' })
}