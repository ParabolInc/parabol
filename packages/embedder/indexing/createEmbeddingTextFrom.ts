import {Selectable} from 'kysely'
import {DB} from 'parabol-server/postgres/pg'
import {createText as createTextFromRetrospectiveDiscussionTopic} from './retrospectiveDiscussionTopic'

export const createEmbeddingTextFrom = async (
  item: Selectable<DB['EmbeddingsIndex']>
): Promise<string> => {
  switch (item.objectType) {
    case 'retrospectiveDiscussionTopic':
      return createTextFromRetrospectiveDiscussionTopic(item)
  }
}
