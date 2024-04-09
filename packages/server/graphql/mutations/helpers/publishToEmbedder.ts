import type {MessageToEmbedder} from 'embedder/custom'
import getRedis from '../../../utils/getRedis'

export const publishToEmbedder = (message: MessageToEmbedder) => {
  return getRedis().xadd(
    'embedMetadataStream',
    'MAXLEN',
    '~',
    1000,
    '*',
    'msg',
    JSON.stringify(message)
  )
}
