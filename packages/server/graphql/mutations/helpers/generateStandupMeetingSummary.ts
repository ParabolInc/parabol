import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import canAccessAI from './canAccessAI'
import getTeamPromptMeetingPrompts from './getTeamPromptMeetingPrompts'

const generateStandupMeetingSummary = async (
  meeting: TeamPromptMeeting,
  dataLoader: DataLoaderWorker
) => {
  const team = await dataLoader.get('teams').loadNonNull(meeting.teamId)
  const isAIAvailable = await canAccessAI(team, dataLoader)
  if (!isAIAvailable) return null

  const [allResponses, prompts] = await Promise.all([
    dataLoader.get('teamPromptResponsesByMeetingId').load(meeting.id),
    getTeamPromptMeetingPrompts(meeting, dataLoader)
  ])
  const responses = allResponses.filter((response) => response.isShared)

  const userIds = responses.map((response) => response.userId)
  const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)

  const contentWithUsers = responses.map((response, idx) => ({
    content: response.plaintextContent,
    user: users[idx]?.preferredName ?? 'Anonymous'
  }))

  if (contentWithUsers.length === 0) return null

  const meetingPrompt =
    prompts.length > 0 ? prompts.map(({question}) => question).join(' / ') : meeting.meetingPrompt
  const manager = new OpenAIServerManager()
  const summary = await manager.getStandupSummary(contentWithUsers, meetingPrompt)
  if (!summary) return null
  return summary
}

export default generateStandupMeetingSummary
