import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {DataLoaderWorker} from '../../graphql'
import updateSmartGroupTitle from './updateReflectionLocation/updateSmartGroupTitle'

interface Reflection {
  plaintextContent: string
}

const makeGroupTitleFromPlaintext = (plaintextContent?: string) => {
  if (!plaintextContent) return ''
  const MAX_CHARS = 30
  return plaintextContent.trim().slice(0, MAX_CHARS).replace(/\n\n/g, ' ')
}

const generateAIGroupTitle = async (
  reflections: Reflection[],
  reflectionGroupId: string,
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const manager = new OpenAIServerManager()
  const aiTitle = await manager.generateGroupTitle(reflections)
  const newTitle = aiTitle ?? makeGroupTitleFromPlaintext(reflections[0]?.plaintextContent)
  if (!newTitle) standardError(new Error('Failed to generate AI title'))
  await updateSmartGroupTitle(reflectionGroupId, newTitle)
  dataLoader.get('retroReflectionGroups').clear(reflectionGroupId)
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpdateReflectionGroupTitlePayload',
    {
      meetingId,
      reflectionGroupId,
      title: aiTitle
    },
    {operationId: dataLoader.share()}
  )
}

export default generateAIGroupTitle
