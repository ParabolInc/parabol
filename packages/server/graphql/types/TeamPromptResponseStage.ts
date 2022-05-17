import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import {getTeamPromptResponsesByMeetingId} from '../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {GQLContext} from '../graphql'
import {resolveTeamMember} from '../resolvers'
import DiscussionThreadStage, {discussionThreadStageFields} from './DiscussionThreadStage'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import TeamMember from './TeamMember'
import TeamPromptResponse from './TeamPromptResponse'

const TeamPromptResponseStage = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptResponseStage',
  description: 'The stage where the single team member responds to a prompt',
  interfaces: () => [NewMeetingStage, DiscussionThreadStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'RESPONSES',
  fields: () => ({
    ...newMeetingStageFields(),
    ...discussionThreadStageFields(),
    teamMember: {
      type: new GraphQLNonNull(TeamMember),
      description: 'The team member this stage belongs to',
      resolve: resolveTeamMember
    },
    response: {
      type: TeamPromptResponse,
      description: 'The response to the prompt',
      resolve: async (
        {meetingId, teamMemberId}: {meetingId: string; teamMemberId: string},
        _args: unknown,
        {}
      ) => {
        // TODO: implement getTeamPromptResponsesByMeetingIdAndUserId
        const responses = await getTeamPromptResponsesByMeetingId(meetingId)
        const userId = TeamMemberId.split(teamMemberId).userId
        return responses.find(({userId: responseUserId}) => responseUserId === userId)
      }
    }
  })
})

export default TeamPromptResponseStage
