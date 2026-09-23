import type {TeamPromptMeeting} from '../../../postgres/types/Meeting'
import {getUserId} from '../../../utils/authorization'
import type {ShareTeamPromptResponsesSuccessResolvers} from '../resolverTypes'

export type ShareTeamPromptResponsesSuccessSource = {meetingId: string; userId: string}

const ShareTeamPromptResponsesSuccess: ShareTeamPromptResponsesSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull<TeamPromptMeeting>(meetingId)
  },
  responses: async ({meetingId, userId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const responses = await dataLoader
      .get('teamPromptResponsesByMeetingIdForViewer')
      .load({meetingId, viewerId})
    return responses.filter((response) => response.userId === userId)
  }
}

export default ShareTeamPromptResponsesSuccess
