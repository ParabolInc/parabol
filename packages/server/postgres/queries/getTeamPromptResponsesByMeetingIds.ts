import getPg from '../getPg'
import {getTeamPromptResponsesByMeetingIdQuery} from './generated/getTeamPromptResponsesByMeetingIdQuery'
import {mapToTeamPromptResponse, TeamPromptResponse} from './getTeamPromptResponsesByIds'

export const getTeamPromptResponsesByMeetingIds = async (
  meetingIds: readonly string[]
): Promise<TeamPromptResponse[]> => {
  const responses = await getTeamPromptResponsesByMeetingIdQuery.run({meetingIds}, getPg())
  return mapToTeamPromptResponse(responses)
}

export const getTeamPromptResponsesByMeetingId = async (
  meetingId: string
): Promise<TeamPromptResponse[]> => {
  return getTeamPromptResponsesByMeetingIds([meetingId])
}
