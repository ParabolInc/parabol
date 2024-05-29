import getKysely from '../../../postgres/getKysely'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import sendToSentry from '../../../utils/sendToSentry'
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
    dataLoader.get('teams').loadNonNull(teamId)
  ])
  const isAISummaryAccessible = await canAccessAISummary(
    team,
    facilitator.featureFlags,
    dataLoader,
    'retrospective'
  )
  if (!isAISummaryAccessible) return
  const [reflections, reflectionGroups] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])
  const pg = getKysely()
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
      const [fullSummary, fullQuestion] = await Promise.all([
        manager.getSummary(reflectionTextByGroupId),
        manager.getDiscussionPromptQuestion(group.title ?? 'Unknown', reflectionsByGroupId)
      ])
      if (!fullSummary && !fullQuestion) return
      const summary = fullSummary?.slice(0, 2000)
      const discussionPromptQuestion = fullQuestion?.slice(0, 2000)
      return pg
        .updateTable('RetroReflectionGroup')
        .set({summary, discussionPromptQuestion})
        .where('id', '=', group.id)
        .execute()
    })
  )
}

export default generateGroupSummaries
