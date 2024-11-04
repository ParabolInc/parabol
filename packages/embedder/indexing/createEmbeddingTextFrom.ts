import {Selectable} from 'kysely'
import {DB} from 'parabol-server/postgres/types/pg'

import {DataLoaderInstance} from '../../server/dataloader/RootDataLoader'
import {createTextFromMeetingTemplate} from './meetingTemplate'
import {createTextFromRetrospectiveDiscussionTopic} from './retrospectiveDiscussionTopic'

export const createEmbeddingTextFrom = async (
  embeddingsMetadata: Selectable<DB['EmbeddingsMetadata']>,
  dataLoader: DataLoaderInstance,
  isRerank?: boolean
) => {
  const {refId} = embeddingsMetadata
  switch (embeddingsMetadata.objectType) {
    case 'retrospectiveDiscussionTopic':
      return createTextFromRetrospectiveDiscussionTopic(refId, dataLoader, isRerank)
    case 'meetingTemplate':
      return createTextFromMeetingTemplate(refId, dataLoader)
    default:
      throw new Error(`Unexcepted objectType: ${embeddingsMetadata.objectType}`)
  }
}

export const isEmbeddingOutdated = async (
  embeddingsMetadata: Selectable<DB['EmbeddingsMetadata']>,
  dataLoader: DataLoaderInstance
) => {
  const {refId, refUpdatedAt} = embeddingsMetadata
  switch (embeddingsMetadata.objectType) {
    case 'retrospectiveDiscussionTopic':
      const discussion = await dataLoader.get('discussions').load(refId)
      return !discussion || discussion?.createdAt > refUpdatedAt
    case 'meetingTemplate':
      const template = await dataLoader.get('meetingTemplates').load(refId)
      return !template || template?.updatedAt > refUpdatedAt
    default:
      throw new Error(`Unexcepted objectType: ${embeddingsMetadata.objectType}`)
  }
}
