const EXPIRY_BUFFER_SECONDS = 30

const toExpiresAt = (expiresIn: number | undefined) =>
  expiresIn ? new Date(Date.now() + (expiresIn - EXPIRY_BUFFER_SECONDS) * 1000) : null

export default toExpiresAt
