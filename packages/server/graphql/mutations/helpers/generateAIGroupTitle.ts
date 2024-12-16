import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {DataLoaderWorker} from '../../graphql'
import updateSmartGroupTitle from './updateReflectionLocation/updateSmartGroupTitle'

interface Reflection {
  entities: any[]
  plaintextContent: string
}

const generateAIGroupTitle = async (
  reflections: Reflection[],
  reflectionGroupId: string,
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const manager = new OpenAIServerManager()
  const aiTitle = await manager.generateGroupTitle(reflections)
  const newTitle = aiTitle ?? reflections[0]?.plaintextContent ?? ''
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
