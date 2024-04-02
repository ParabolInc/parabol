import {Selectable} from 'kysely'
import {DB} from 'parabol-server/postgres/pg'

import RootDataLoader from 'parabol-server/dataloader/RootDataLoader'
import {createTextFromRetrospectiveDiscussionTopic} from './retrospectiveDiscussionTopic'

export const createEmbeddingTextFrom = async (
  embeddingsMetadata: Selectable<DB['EmbeddingsMetadata']>,
  dataLoader: RootDataLoader
) => {
  switch (embeddingsMetadata.objectType) {
    case 'retrospectiveDiscussionTopic':
      return createTextFromRetrospectiveDiscussionTopic(embeddingsMetadata.refId, dataLoader)
    default:
      throw new Error(`Unexcepted objectType: ${embeddingsMetadata.objectType}`)
  }
}
