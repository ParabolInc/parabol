import getRethink from '../../../database/rethinkDriver'
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
  const organization = await dataLoader.get('organizations').load(team.orgId)
  const isAISummaryAccessible = await canAccessAISummary(team, facilitator.featureFlags, dataLoader)
  if (!isAISummaryAccessible) return
  const [reflections, reflectionGroups] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])
  const r = await getRethink()
  const pg = getKysely()
  const manager = new OpenAIServerManager()
  if (!reflectionGroups.length) {
    const error = new Error('No reflection groups in generateGroupSummaries')
    sendToSentry(error, {userId: facilitator.id, tags: {meetingId}})
    return
  }
  const aiGeneratedDiscussionPromptEnabled = organization.featureFlags?.includes(
    'AIGeneratedDiscussionPrompt'
  )
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
        aiGeneratedDiscussionPromptEnabled
          ? manager.getDiscussionPromptQuestion(group.title ?? 'Unknown', reflectionsByGroupId)
          : undefined
      ])
      if (!fullSummary && !fullQuestion) return
      const summary = fullSummary?.slice(0, 2000)
      const discussionPromptQuestion = fullQuestion?.slice(0, 2000)
      return Promise.all([
        pg
          .updateTable('RetroReflectionGroup')
          .set({summary, discussionPromptQuestion})
          .where('id', '=', group.id)
          .execute(),
        r
          .table('RetroReflectionGroup')
          .get(group.id)
          .update({summary, discussionPromptQuestion})
          .run()
      ])
    })
  )
}

export default generateGroupSummaries
