import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getSimpleGroupTitle} from '../../../../client/utils/getSimpleGroupTitle'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import updateSmartGroupTitle from './updateReflectionLocation/updateSmartGroupTitle'

interface Reflection {
  plaintextContent: string
}

const generateAIGroupTitle = async (
  reflections: Reflection[],
  reflectionGroupId: string,
  meetingId: string
) => {
  const manager = new OpenAIServerManager()
  const aiTitle = await manager.generateGroupTitle(reflections)
  const newTitle = aiTitle ?? getSimpleGroupTitle(reflections)
  if (!newTitle) standardError(new Error('Failed to generate AI title'))
  await updateSmartGroupTitle(reflectionGroupId, newTitle)
  // create a brand new dataloader to share with the other workers because
  // the existing dataloader was shared before the titles were updated
  const dataLoader = getNewDataLoader(`generateAIGroupTitle`)
  const operationId = dataLoader.share()
  await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
  dataLoader.dispose()
  const subOptions = {operationId}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'UpdateReflectionGroupTitlePayload',
    {
      meetingId,
      reflectionGroupId,
      title: aiTitle
    },
    subOptions
  )
}

export default generateAIGroupTitle
