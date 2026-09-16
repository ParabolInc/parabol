import {activeEmbeddingModelId} from '../../../../embedder/activeEmbeddingModel'
import getKysely from '../../../postgres/getKysely'
import {embeddingResponder} from '../../../utils/embeddingResponder'
import {publishToEmbedder} from './publishToEmbedder'
import refreshSuggestedGroups from './refreshSuggestedGroups'

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
  // Resolves once the embedder has written the vector, so everything below reads it back
  const embedding = await publishToEmbedder({
    jobType: 'embed:start',
    embeddingsMetadataId: metadata.id,
    data: {requestId, channelName: embeddingResponder.channelName}
  })

  // This vector is an input to similarity grouping, so the board's suggestions are now out of date.
  // Hooked here rather than in the reflection mutations because those return before the vector
  // exists, and grouping without it would place the card the user just touched by its old wording.
  if (embedding instanceof Error) return
  await refreshSuggestedGroups(meetingId)
}
