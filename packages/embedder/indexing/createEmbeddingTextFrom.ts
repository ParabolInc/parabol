import type {Selectable} from 'kysely'
import type {DB} from 'parabol-server/postgres/types/pg'

import type {DataLoaderInstance} from '../../server/dataloader/RootDataLoader'
import {createTextFromMeetingTemplate} from './meetingTemplate'
import {createTextFromPage} from './page'
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
    case 'page':
      return createTextFromPage(refId as any, dataLoader)
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
    case 'retrospectiveDiscussionTopic': {
      const discussion = await dataLoader.get('discussions').load(refId)
      return !discussion || discussion?.createdAt > refUpdatedAt
    }
    case 'meetingTemplate': {
      const template = await dataLoader.get('meetingTemplates').load(refId)
      return !template || template?.updatedAt > refUpdatedAt
    }
    case 'page': {
      const page = await dataLoader.get('pages').load(refId as any)
      return !page || page.updatedAt > refUpdatedAt
    }
    default:
      throw new Error(`Unexcepted objectType: ${embeddingsMetadata.objectType}`)
  }
}
