import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import type {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import canAccessAI from './canAccessAI'
import getMeetingTemplatePrompts from './getMeetingTemplatePrompts'
import getSharedTeamPromptResponses from './getSharedTeamPromptResponses'

const generateStandupMeetingSummary = async (
  meeting: TeamPromptMeeting,
  dataLoader: DataLoaderWorker
) => {
  const team = await dataLoader.get('teams').loadNonNull(meeting.teamId)
  const isAIAvailable = await canAccessAI(team, dataLoader)
  if (!isAIAvailable) return null

  const [responses, prompts] = await Promise.all([
    getSharedTeamPromptResponses(meeting.id, dataLoader),
    getMeetingTemplatePrompts(meeting, dataLoader)
  ])

  const userIds = responses.map((response) => response.userId)
  const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)

  const contentWithUsers = responses.map((response) => ({
    content: response.plaintextContent,
    user: users.find((user) => user.id === response.userId)?.preferredName ?? 'Anonymous'
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
