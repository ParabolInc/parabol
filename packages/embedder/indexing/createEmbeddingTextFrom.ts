import type {Selectable} from 'kysely'
import type {DataLoaderInstance} from '../../server/dataloader/RootDataLoader'
import type {DB} from '../../server/postgres/types/pg'
import type {DiscussionTextFormat} from '../ai_models/AbstractEmbeddingsModel'
import {createTextFromMeetingTemplate} from './meetingTemplate'
import {createTextFromRetroReflection} from './retroReflection'
import {
  createPlainTextFromRetrospectiveDiscussionTopic,
  createTextFromRetrospectiveDiscussionTopic
} from './retrospectiveDiscussionTopic'

export const createEmbeddingTextFrom = async (
  embeddingsMetadata: Selectable<DB['EmbeddingsMetadata']>,
  dataLoader: DataLoaderInstance,
  options: {isRerank?: boolean; discussionText?: DiscussionTextFormat} = {}
) => {
  const {refId} = embeddingsMetadata
  switch (embeddingsMetadata.objectType) {
    case 'retrospectiveDiscussionTopic':
      return options.discussionText === 'plain'
        ? createPlainTextFromRetrospectiveDiscussionTopic(refId, dataLoader)
        : createTextFromRetrospectiveDiscussionTopic(refId, dataLoader, options.isRerank)
    case 'meetingTemplate':
      return createTextFromMeetingTemplate(refId, dataLoader)
    case 'retroReflection':
      return createTextFromRetroReflection(refId, dataLoader)
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
    case 'retroReflection': {
      const reflection = await dataLoader.get('retroReflections').load(refId)
      return !reflection || reflection.updatedAt > refUpdatedAt
    }
    default:
      throw new Error(`Unexcepted objectType: ${embeddingsMetadata.objectType}`)
  }
}
