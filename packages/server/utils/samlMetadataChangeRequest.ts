import {randomBytes} from 'crypto'
import ms from 'ms'
import getRedis from './getRedis'

export interface SAMLMetadataChangeRequest {
  samlId: string
  metadataURL: string
  requestedBy: string
}

const TTL_MS = ms('15m')
const getKey = (id: string) => `samlMetadataChange:${id}`

// The IdP echoes the RelayState back verbatim, so it must never carry the metadata URL itself.
// It carries this single-use id instead, bound to the org admin who chose the URL.
export const createSAMLMetadataChangeRequest = async (request: SAMLMetadataChangeRequest) => {
  const id = randomBytes(32).toString('base64url')
  await getRedis().set(getKey(id), JSON.stringify(request), 'PX', TTL_MS)
  return id
}

export const consumeSAMLMetadataChangeRequest = async (id: string) => {
  const value = await getRedis().getdel(getKey(id))
  if (!value) return null
  return JSON.parse(value) as SAMLMetadataChangeRequest
}
