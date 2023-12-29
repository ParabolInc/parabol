import {Selectable} from 'kysely'
import {DB} from 'parabol-server/postgres/pg'
import {DataLoaderWorker} from 'parabol-server/graphql/graphql'

import {createText as createTextFromRetrospectiveDiscussionTopic} from './retrospectiveDiscussionTopic'

export const createEmbeddingTextFrom = async (
  item: Selectable<DB['EmbeddingsIndex']>,
  dataLoader: DataLoaderWorker
): Promise<string> => {
  switch (item.objectType) {
    case 'retrospectiveDiscussionTopic':
      return createTextFromRetrospectiveDiscussionTopic(item, dataLoader)
  }
}
