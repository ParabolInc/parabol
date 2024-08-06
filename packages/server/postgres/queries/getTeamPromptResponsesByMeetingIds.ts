import {selectTeamPromptResponses} from '../select'

export const getTeamPromptResponsesByMeetingIds = async (meetingIds: readonly string[]) => {
  return selectTeamPromptResponses().where('meetingId', 'in', meetingIds).execute()
}

export const getTeamPromptResponsesByMeetingId = async (meetingId: string) => {
  return getTeamPromptResponsesByMeetingIds([meetingId])
}
