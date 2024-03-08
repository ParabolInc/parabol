import {Selectable} from 'kysely'
import {DataLoaderWorker} from 'parabol-server/graphql/graphql'
import {DB} from 'parabol-server/postgres/pg'

import {createTextFromRetrospectiveDiscussionTopic} from './retrospectiveDiscussionTopic'

export const createEmbeddingTextFrom = async (
  embeddingsMetadata: Selectable<DB['EmbeddingsMetadata']>,
  dataLoader: DataLoaderWorker
) => {
  switch (embeddingsMetadata.objectType) {
    case 'retrospectiveDiscussionTopic':
      return createTextFromRetrospectiveDiscussionTopic(embeddingsMetadata.refId, dataLoader)
    default:
      throw new Error(`Unexcepted objectType: ${embeddingsMetadata.objectType}`)
  }
}
