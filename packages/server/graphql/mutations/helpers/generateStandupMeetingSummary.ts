import OpenAIServerManager from '../../../utils/OpenAIServerManager'
import {DataLoaderWorker} from '../../graphql'
import {isAISummaryAllowed} from './canAccessAISummary'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'

const generateStandupMeetingSummary = async (
  meeting: MeetingTeamPrompt,
  dataLoader: DataLoaderWorker
) => {
  const [facilitator, team] = await Promise.all([
    dataLoader.get('users').loadNonNull(meeting.facilitatorUserId),
    dataLoader.get('teams').loadNonNull(meeting.teamId)
  ])
  const organization = await dataLoader.get('organizations').load(team.orgId)
  const isAISummaryAccessible =
    (await isAISummaryAllowed(team, facilitator.featureFlags, dataLoader)) &&
    organization.featureFlags?.includes('standupAISummary')

  if (!isAISummaryAccessible) return
  const responses = await getTeamPromptResponsesByMeetingId(meeting.id)

  const contentToSummarize = responses.map((response) => response.plaintextContent)
  if (contentToSummarize.length === 0) return

  const manager = new OpenAIServerManager()
  const summary = await manager.getStandupSummary(contentToSummarize, meeting.meetingPrompt)
  if (!summary) return
  return summary
}

export default generateStandupMeetingSummary
