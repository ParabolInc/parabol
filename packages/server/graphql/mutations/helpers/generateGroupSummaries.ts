import getRethink from '../../../database/rethinkDriver'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import sendToSentry from '../../../utils/sendToSentry'
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
  if (!reflectionGroups.length) {
    const error = new Error('No reflection groups in generateGroupSummaries')
    sendToSentry(error, {userId: facilitator.id, tags: {meetingId}})
    return
  }
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
      if (!summary) {
        const error = new Error('Failed to create the AI topic summary')
        const summaryText = JSON.stringify(reflectionTextByGroupId)
        sendToSentry(error, {
          userId: facilitator.id,
          tags: {summaryText, reflectionGroupId: group.id, meetingId}
        })
        return
      }
      return r.table('RetroReflectionGroup').get(group.id).update({summary}).run()
    })
  )
}

export default generateGroupSummaries
