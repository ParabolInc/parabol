import {DBInsert} from '../embedder'
import {pg} from './retrospectiveDiscussionTopic'

export async function upsertEmbeddingsIndexRows(
  embeddingsIndexRows: DBInsert['EmbeddingsIndex'][]
) {
  return pg
    .insertInto('EmbeddingsIndex')
    .values(embeddingsIndexRows)
    .onConflict((oc) =>
      oc.columns(['objectType', 'refTable', 'refId']).doUpdateSet((eb) => ({
        objectType: eb.ref('excluded.objectType'),
        refTable: eb.ref('excluded.refTable'),
        refId: eb.ref('excluded.refId'),
        refDateTime: eb.ref('excluded.refDateTime')
        // state: eb.ref('excluded.state'),          // preserve the prior values
        // teamId: eb.ref('excluded.teamId'),
        // orgId: eb.ref('excluded.orgId'),
        // embedText: eb.ref('excluded.embedText')
      }))
    )
    .execute()
}
