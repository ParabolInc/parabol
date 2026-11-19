import crypto from 'crypto'
import {fetchUntrusted} from '../utils/fetchUntrusted'
import getRedis from '../utils/getRedis'
import cimdCacheSeconds from './cimdCacheSeconds'
import validateClientMetadataDocument, {type ClientMetadata} from './validateClientMetadataDocument'

const MAX_DOCUMENT_BYTES = 64 * 1024
const DEADLINE_MS = 5000
const FAILURE_CACHE_SECONDS = 60

const parseJSON = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

const fetchAndValidate = async (
  url: string
): Promise<{metadata: ClientMetadata; cacheSeconds: number} | {error: string}> => {
  const response = await fetchUntrusted(url, MAX_DOCUMENT_BYTES, {deadlineMs: DEADLINE_MS})
  if (!response) return {error: 'Invalid client_id: its metadata document could not be fetched'}
  const document = parseJSON(response.buffer.toString('utf8'))
  if (document === undefined) return {error: 'Invalid client_id: its metadata document is not JSON'}
  const metadata = validateClientMetadataDocument(url, document)
  if ('error' in metadata) return metadata
  return {metadata, cacheSeconds: cimdCacheSeconds(response.cacheControl)}
}

const fetchClientMetadataDocument = async (
  url: string
): Promise<ClientMetadata | {error: string}> => {
  const redis = getRedis()
  const urlHash = crypto.createHash('sha256').update(url).digest('hex')
  const key = `oauth:cimd:${urlHash}`
  const failureKey = `oauth:cimdFailure:${urlHash}`
  const cached = await redis.get(key)
  if (cached !== null) {
    const metadata = validateClientMetadataDocument(url, parseJSON(cached))
    if (!('error' in metadata)) return metadata
  }
  const cachedFailure = await redis.get(failureKey)
  if (cachedFailure !== null) return {error: cachedFailure}
  const fetched = await fetchAndValidate(url)
  if ('error' in fetched) {
    await redis.set(failureKey, fetched.error, 'EX', FAILURE_CACHE_SECONDS)
    return fetched
  }
  const {metadata, cacheSeconds} = fetched
  const document = {client_id: url, redirect_uris: metadata.redirectUris}
  await redis.set(key, JSON.stringify(document), 'EX', cacheSeconds)
  return metadata
}

export default fetchClientMetadataDocument
