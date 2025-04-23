import {getSimpleGroupTitle} from 'parabol-client/utils/getSimpleGroupTitle'
import {DataLoaderWorker} from '../../graphql'
import {RetroReflection} from '../../public/resolverTypes'
import canAccessAI from './canAccessAI'
import generateAIGroupTitle from './generateAIGroupTitle'
import updateSmartGroupTitle from './updateReflectionLocation/updateSmartGroupTitle'

type Input = {
  reflections: RetroReflection[]
  reflectionGroupId: string
  meetingId: string
  teamId: string
  dataLoader: DataLoaderWorker
}

const updateGroupTitle = async (input: Input) => {
  const {reflections, reflectionGroupId, meetingId, teamId, dataLoader} = input
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const hasAIAccess = await canAccessAI(team, dataLoader)
  if (reflections.length === 1 || !hasAIAccess) {
    const smartTitle = getSimpleGroupTitle(reflections)
    await updateSmartGroupTitle(reflectionGroupId, smartTitle)
    return
  }
  // Generate title and don't await or the reflection will hang when it's dropped
  generateAIGroupTitle(reflections, reflectionGroupId, meetingId, dataLoader)
}

export default updateGroupTitle
