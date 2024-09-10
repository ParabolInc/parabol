import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {getTeamPromptResponsesByMeetingId} from '../../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {TeamPromptResponseStageResolvers} from '../resolverTypes'

const TeamPromptResponseStage: TeamPromptResponseStageResolvers = {
  __isTypeOf: ({phaseType}) => phaseType === 'RESPONSES',
  response: async ({meetingId, teamMemberId}, _args) => {
    // TODO: implement getTeamPromptResponsesByMeetingIdAndUserId
    const responses = await getTeamPromptResponsesByMeetingId(meetingId)
    const userId = TeamMemberId.split(teamMemberId).userId
    return responses.find(({userId: responseUserId}) => responseUserId === userId)!
  }
}

export default TeamPromptResponseStage
