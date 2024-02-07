import {DBInsert} from '../embedder'
import {pg} from './retrospectiveDiscussionTopic'

export async function upsertEmbeddingsMetaRows(
  embeddingsMetaRows: DBInsert['EmbeddingsMetadata'][]
) {
  return pg
    .insertInto('EmbeddingsMetadata')
    .values(embeddingsMetaRows)
    .onConflict((oc) =>
      oc.columns(['objectType', 'refId']).doUpdateSet((eb) => ({
        objectType: eb.ref('excluded.objectType'),
        refId: eb.ref('excluded.refId'),
        refUpdatedAt: eb.ref('excluded.refUpdatedAt')
      }))
    )
    .execute()
}
