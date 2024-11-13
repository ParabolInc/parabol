import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'

const generateStandupMeetingSummary = async (
  meeting: TeamPromptMeeting,
  dataLoader: DataLoaderWorker
) => {
  const team = await dataLoader.get('teams').loadNonNull(meeting.teamId)
  const isAIAvailable = await canAccessAI(team, 'standup', dataLoader)
  if (!isAIAvailable) return

  const responses = await getTeamPromptResponsesByMeetingId(meeting.id)

  const contentToSummarize = responses.map((response) => response.plaintextContent)
  if (contentToSummarize.length === 0) return

  const manager = new OpenAIServerManager()
  const summary = await manager.getStandupSummary(contentToSummarize, meeting.meetingPrompt)
  if (!summary) return
  return summary
}

export default generateStandupMeetingSummary
