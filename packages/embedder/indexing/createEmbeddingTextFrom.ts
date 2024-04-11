import {Selectable} from 'kysely'
import {DB} from 'parabol-server/postgres/pg'

import {DataLoaderInstance} from '../../server/dataloader/RootDataLoader'
import {createTextFromRetrospectiveDiscussionTopic} from './retrospectiveDiscussionTopic'

export const createEmbeddingTextFrom = async (
  embeddingsMetadata: Selectable<DB['EmbeddingsMetadata']>,
  dataLoader: DataLoaderInstance,
  isRerank?: boolean
) => {
  switch (embeddingsMetadata.objectType) {
    case 'retrospectiveDiscussionTopic':
      return createTextFromRetrospectiveDiscussionTopic(
        embeddingsMetadata.refId,
        dataLoader,
        isRerank
      )
    default:
      throw new Error(`Unexcepted objectType: ${embeddingsMetadata.objectType}`)
  }
}
