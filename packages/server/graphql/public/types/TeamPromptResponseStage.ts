import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {getUserId} from '../../../utils/authorization'
import type {TeamPromptResponseStageResolvers} from '../resolverTypes'

const TeamPromptResponseStage: TeamPromptResponseStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'RESPONSES',
  responses: async ({meetingId, teamMemberId}, _args, {authToken, dataLoader}) => {
    const {userId} = TeamMemberId.split(teamMemberId)
    const viewerId = getUserId(authToken)
    const responses = await dataLoader
      .get('teamPromptResponsesByMeetingIdForViewer')
      .load({meetingId, viewerId})
    return responses.filter((response) => response.userId === userId)
  },
  response: async ({meetingId, teamMemberId}, _args, {authToken, dataLoader}) => {
    const {userId} = TeamMemberId.split(teamMemberId)
    const viewerId = getUserId(authToken)
    const responses = await dataLoader
      .get('teamPromptResponsesByMeetingIdForViewer')
      .load({meetingId, viewerId})
    return responses.find((response) => response.userId === userId) ?? null
  }
}

export default TeamPromptResponseStage
