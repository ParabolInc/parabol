import getKysely from '../../../postgres/getKysely'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import sendToSentry from '../../../utils/sendToSentry'
import {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'

const generateDiscussionPrompt = async (
  meetingId: string,
  teamId: string,
  dataLoader: DataLoaderWorker,
  facilitatorUserId: string
) => {
  const [facilitator, team] = await Promise.all([
    dataLoader.get('users').loadNonNull(facilitatorUserId),
    dataLoader.get('teams').loadNonNull(teamId)
  ])
  const isAIAvailable = await canAccessAI(team, dataLoader)
  if (!isAIAvailable) return
  const [reflections, reflectionGroups] = await Promise.all([
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId),
    dataLoader.get('retroReflectionGroupsByMeetingId').load(meetingId)
  ])
  const pg = getKysely()
  const manager = new OpenAIServerManager()
  if (!reflectionGroups.length) {
    const error = new Error('No reflection groups in generateDiscussionPrompt')
    sendToSentry(error, {userId: facilitator.id, tags: {meetingId}})
    return
  }
  await Promise.all(
    reflectionGroups.map(async (group) => {
      const reflectionsByGroupId = reflections.filter(
        ({reflectionGroupId}) => reflectionGroupId === group.id
      )
      if (reflectionsByGroupId.length <= 1) return
      const fullQuestion = await manager.getDiscussionPromptQuestion(
        group.title ?? 'Unknown',
        reflectionsByGroupId
      )
      if (!fullQuestion) return
      const discussionPromptQuestion = fullQuestion?.slice(0, 2000)
      return pg
        .updateTable('RetroReflectionGroup')
        .set({discussionPromptQuestion})
        .where('id', '=', group.id)
        .execute()
    })
  )
}

export default generateDiscussionPrompt
