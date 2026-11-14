import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import canAccessAI from './canAccessAI'

const generateStandupMeetingSummary = async (
  meeting: TeamPromptMeeting,
  dataLoader: DataLoaderWorker
) => {
  const team = await dataLoader.get('teams').loadNonNull(meeting.teamId)
  const isAIAvailable = await canAccessAI(team, dataLoader)
  if (!isAIAvailable) return null

  const [responses, prompts] = await Promise.all([
    dataLoader.get('teamPromptMemberResponsesByMeetingId').load(meeting.id),
    dataLoader.get('templatePromptsByMeetingId').load(meeting.id)
  ])

  const userIds = responses.map((response) => response.userId)
  const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)

  const contentWithUsers = responses.map((response) => ({
    content: response.plaintextContent,
    user: users.find((user) => user.id === response.userId)?.preferredName ?? 'Anonymous'
  }))

  if (contentWithUsers.length === 0) return null

  const manager = new OpenAIServerManager()
  const summary = await manager.getStandupSummary(
    contentWithUsers,
    prompts.map(({question}) => question)
  )
  if (!summary) return null
  return summary
}

export default generateStandupMeetingSummary
