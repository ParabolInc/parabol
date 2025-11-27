import {getSimpleGroupTitle} from 'parabol-client/utils/getSimpleGroupTitle'
import type {RetroReflection} from '../../../postgres/types'
import type {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'
import generateAIGroupTitle from './generateAIGroupTitle'
import updateSmartGroupTitle from './updateReflectionLocation/updateSmartGroupTitle'

type Input = {
  reflections: Pick<RetroReflection, 'plaintextContent'>[]
  reflectionGroupId: string
  meetingId: string
  teamId: string
  dataLoader: DataLoaderWorker
}

const updateGroupTitle = async (input: Input) => {
  const {reflections, reflectionGroupId, meetingId, teamId, dataLoader} = input
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const hasAIAccess = await canAccessAI(team, dataLoader)
  if (!hasAIAccess) {
    const smartTitle = getSimpleGroupTitle(reflections)
    await updateSmartGroupTitle(reflectionGroupId, smartTitle)
    return
  }
  // Generate title and don't await or the reflection will hang when it's dropped
  generateAIGroupTitle(reflections, reflectionGroupId, meetingId)
}

export default updateGroupTitle
