import {Selectable} from 'kysely'
import {DataLoaderWorker} from 'parabol-server/graphql/graphql'
import {DB} from 'parabol-server/postgres/pg'

import {createText as createTextFromRetrospectiveDiscussionTopic} from './retrospectiveDiscussionTopic'

export const createEmbeddingTextFrom = async (
  item: Selectable<DB['EmbeddingsJobQueue']>,
  dataLoader: DataLoaderWorker
): Promise<any> => {
  switch ((item as any).objectType) {
    case 'retrospectiveDiscussionTopic':
      return createTextFromRetrospectiveDiscussionTopic(item, dataLoader)
  }
}
