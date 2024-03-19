import type {MessageToEmbedder} from '../../../../embedder/embedder'
import getRedis from '../../../utils/getRedis'

export const publishToEmbedder = (message: MessageToEmbedder) => {
  return getRedis().xadd('embedderStream', 'MAXLEN', '~', 1000, '*', 'msg', JSON.stringify(message))
}
