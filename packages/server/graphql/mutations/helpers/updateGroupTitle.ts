import getGroupSmartTitle from '../../../../client/utils/smartGroup/getGroupSmartTitle'
import getKysely from '../../../postgres/getKysely'
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
  const hasAIAccess = await canAccessAI(team, 'retrospective', dataLoader)

  if (reflections.length === 1) {
    // For single reflection, use its content as the title
    const newTitle = reflections[0].plaintextContent
    await updateSmartGroupTitle(reflectionGroupId, newTitle)
  } else if (!hasAIAccess) {
    const smartTitle = getGroupSmartTitle(reflections)
    await updateSmartGroupTitle(reflectionGroupId, smartTitle)
  } else {
    const pg = getKysely()
    await pg
      .updateTable('RetroReflectionGroup')
      .set({title: '', smartTitle: ''})
      .where('id', '=', reflectionGroupId)
      .execute()
    // Generate title and don't await or the reflection will hang when it's dropped
    generateAIGroupTitle(reflections, reflectionGroupId, meetingId, team, dataLoader)
  }
}

export default updateGroupTitle
