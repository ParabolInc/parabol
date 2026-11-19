const MIN_SECONDS = 300
const MAX_SECONDS = 86400
const DEFAULT_SECONDS = 3600

const MAX_AGE = /(?:^|,)\s*max-age\s*=\s*"?(\d+)"?\s*(?:,|$)/i

const cimdCacheSeconds = (cacheControl: string | null) => {
  const maxAge = cacheControl?.match(MAX_AGE)?.[1]
  if (!maxAge) return DEFAULT_SECONDS
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, Number(maxAge)))
}

export default cimdCacheSeconds
