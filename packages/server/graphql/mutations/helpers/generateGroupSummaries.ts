import {Threshold} from '../../../../client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const generateGroupSummaries = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker,
  facilitatorUserId: string
) => {
  const [reflections, reflectionGroups, facilitator, team] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('users').loadNonNull(facilitatorUserId),
    dataLoader.get('teams').load(teamId)
  ])
  if (!facilitator.featureFlags.includes('aiSummary') || !team) return
  if (team.qualAIMeetingsCount > Threshold.MAX_QUAL_AI_MEETINGS) return
  const r = await getRethink()
  const manager = new OpenAIServerManager()
  await Promise.all(
    reflectionGroups.map(async (group) => {
      const reflectionsByGroupId = reflections.filter(
        ({reflectionGroupId}) => reflectionGroupId === group.id
      )
      if (reflectionsByGroupId.length <= 1) return
      const reflectionTextByGroupId = reflectionsByGroupId.map(
        ({plaintextContent}) => plaintextContent
      )
      const summary = await manager.getSummary(reflectionTextByGroupId)
      if (!summary) return
      return r.table('RetroReflectionGroup').get(group.id).update({summary}).run()
    })
  )
}

export default generateGroupSummaries
