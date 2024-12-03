import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getGroupSmartTitle from '../../../../client/utils/smartGroup/getGroupSmartTitle'
import {Team} from '../../../postgres/types'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import publish from '../../../utils/publish'
import {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'
import updateSmartGroupTitle from './updateReflectionLocation/updateSmartGroupTitle'

interface Reflection {
  entities: any[]
  plaintextContent: string
}

const generateAIGroupTitle = async (
  reflections: Reflection[],
  reflectionGroupId: string,
  meetingId: string,
  team: Team,
  dataLoader: DataLoaderWorker
) => {
  const hasAIAccess = await canAccessAI(team, 'retrospective', dataLoader)

  if (hasAIAccess) {
    const manager = new OpenAIServerManager()
    const aiTitle = await manager.generateGroupTitle(reflections)
    if (aiTitle) {
      await updateSmartGroupTitle(reflectionGroupId, aiTitle)
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
  } else {
    const smartTitle = getGroupSmartTitle(reflections)
    await updateSmartGroupTitle(reflectionGroupId, smartTitle)
    dataLoader.get('retroReflectionGroups').clear(reflectionGroupId)
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'UpdateReflectionGroupTitlePayload',
      {
        meetingId,
        reflectionGroupId,
        title: smartTitle
      },
      {operationId: dataLoader.share()}
    )
  }
}

export default generateAIGroupTitle
