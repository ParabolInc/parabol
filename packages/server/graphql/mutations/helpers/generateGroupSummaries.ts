import getRethink from '../../../database/rethinkDriver'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import canAccessAISummary from './canAccessAISummary'

const generateGroupSummaries = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker,
  facilitatorUserId: string
) => {
  const [facilitator, team] = await Promise.all([
    dataLoader.get('users').loadNonNull(facilitatorUserId),
    dataLoader.get('teams').load(teamId)
  ])
  if (!canAccessAISummary(team, facilitator.featureFlags)) return
  const [reflections, reflectionGroups] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])
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
