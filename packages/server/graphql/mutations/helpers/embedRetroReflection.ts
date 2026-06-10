import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {activeEmbeddingModelId} from '../../../../embedder/activeEmbeddingModel'
import getKysely from '../../../postgres/getKysely'
import {embeddingResponder} from '../../../utils/embeddingResponder'
import publish from '../../../utils/publish'
import {publishToEmbedder} from './publishToEmbedder'

const IS_EMBEDDER_ENABLED = !!parseInt(process.env.AI_EMBEDDER_WORKERS!)

let nextRequestId = 0

export const embedRetroReflection = async (
  reflectionId: string,
  meetingId: string,
  teamId: string,
  updatedAt: Date
) => {
  if (!IS_EMBEDDER_ENABLED || !activeEmbeddingModelId) return
  const pg = getKysely()
  const metadata = await pg
    .insertInto('EmbeddingsMetadata')
    .values({
      objectType: 'retroReflection',
      refId: reflectionId,
      refUpdatedAt: updatedAt,
      teamId
    })
    .onConflict((oc) =>
      oc.columns(['refId', 'objectType']).doUpdateSet((eb) => ({
        refUpdatedAt: eb.ref('excluded.refUpdatedAt')
      }))
    )
    .returning('id')
    .executeTakeFirstOrThrow()

  const requestId = ++nextRequestId
  await publishToEmbedder({
    jobType: 'embed:start',
    embeddingsMetadataId: metadata.id,
    data: {requestId, channelName: embeddingResponder.channelName}
  })

  publish(SubscriptionChannel.MEETING, meetingId, 'ReflectionEmbeddingSuccess', {reflectionId})
}
