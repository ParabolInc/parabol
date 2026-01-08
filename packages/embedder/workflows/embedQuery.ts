import {Packr} from 'msgpackr'
import getRedis from '../../server/utils/getRedis'
import getModelManager from '../ai_models/ModelManager'
import type {JobQueueStepRun} from '../custom'
import type {EmbeddingsTableName} from '../getEmbeddingsTableName'
import {JobQueueError} from '../JobQueueError'

export interface EmbedQueryData {
  query: string
  model: EmbeddingsTableName
  requestId: number
  channelName: `userQueryEmbedding:${string}`
}

const packr = new Packr({
  moreTypes: true
})
export const embedQuery: JobQueueStepRun<EmbedQueryData> = async (context) => {
  const {data} = context
  const {model, query, requestId, channelName} = data
  const modelManager = getModelManager()

  const embeddingModel = modelManager.getEmbedder(model)
  if (!embeddingModel) {
    return new JobQueueError(`embedding model ${model} not available`)
  }
  const embeddingVector = await embeddingModel.getEmbedding(query)
  const vector = embeddingVector instanceof Error ? [] : embeddingVector
  // Float16Array isn't available as of NodeJs v22.21.1
  // It also isn't part of the msgpack spec yet
  // So, we take fp64 and send it over the wire as fp32 to cut the payload in half
  // Then insert it into PG as fp16, if the embedding is halfvec
  // The loss between bp16 and fp16 is insignificant when doing cosine similarities
  // It's only important in intermediary layers, the final output vector rarely has large spikes
  const response = {vector: new Float32Array(vector), requestId}
  const msg = packr.pack(response)
  if (requestId) {
    getRedis()
      .publish(channelName, msg)
      .catch(() => {})
  }
  return embeddingVector instanceof Error ? new JobQueueError(embeddingVector.message) : data
}
