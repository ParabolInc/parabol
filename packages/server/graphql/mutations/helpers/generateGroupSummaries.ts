import getRethink from '../../../database/rethinkDriver'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const generateGroupSummaries = async (
  meetingId: string,
  dataLoader: DataLoaderWorker,
  facilitatorUserId: string
) => {
  const [reflections, reflectionGroups, facilitator] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId),
    dataLoader.get('users').loadNonNull(facilitatorUserId)
  ])
  if (!facilitator.featureFlags.includes('aiSummary')) return
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
