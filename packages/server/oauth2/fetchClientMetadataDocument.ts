import crypto from 'crypto'
import {fetchUntrusted} from '../utils/fetchUntrusted'
import getRedis from '../utils/getRedis'
import cimdCacheSeconds from './cimdCacheSeconds'

const MAX_DOCUMENT_BYTES = 64 * 1024
const TIMEOUT_MS = 5000

const parseJSON = (text: string): {document: unknown} | null => {
  try {
    return {document: JSON.parse(text)}
  } catch {
    return null
  }
}

const fetchClientMetadataDocument = async (
  url: string
): Promise<{document: unknown} | {error: string}> => {
  const redis = getRedis()
  const key = `oauth:cimd:${crypto.createHash('sha256').update(url).digest('hex')}`
  const cached = await redis.get(key)
  if (cached !== null) return {document: JSON.parse(cached)}
  const response = await fetchUntrusted(url, MAX_DOCUMENT_BYTES, {timeoutMs: TIMEOUT_MS})
  if (!response) return {error: 'Invalid client_id: its metadata document could not be fetched'}
  const text = response.buffer.toString('utf8')
  const parsed = parseJSON(text)
  if (!parsed) return {error: 'Invalid client_id: its metadata document is not JSON'}
  await redis.set(key, text, 'EX', cimdCacheSeconds(response.cacheControl))
  return parsed
}

export default fetchClientMetadataDocument
