import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import type {ShareTeamPromptResponsesSuccessResolvers} from '../resolverTypes'

export type ShareTeamPromptResponsesSuccessSource = {meetingId: string; userId: string}

const ShareTeamPromptResponsesSuccess: ShareTeamPromptResponsesSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamPrompt') throw new GraphQLError('Not a stand-up')
    return meeting
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
