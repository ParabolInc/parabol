import type {MessageToEmbedder} from 'embedder/custom'
import {getEmbedderPriority} from '../../../../embedder/getEmbedderPriority'
import getKysely from '../../../postgres/getKysely'

export const publishToEmbedder = ({jobType, data, priority}: MessageToEmbedder) => {
  return getKysely()
    .insertInto('EmbeddingsJobQueue')
    .values({
      jobType,
      priority: getEmbedderPriority(priority),
      jobData: JSON.stringify(data)
    })
}
