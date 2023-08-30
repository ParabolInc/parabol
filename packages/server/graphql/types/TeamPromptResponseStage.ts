import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMemberId from '../../../client/shared/gqlIds/TeamMemberId'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import {getTeamPromptResponsesByMeetingId} from '../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {GQLContext} from '../graphql'
import {resolveTeamMember} from '../resolvers'
import DiscussionThreadStage, {discussionThreadStageFields} from './DiscussionThreadStage'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import TeamMember from './TeamMember'

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
    }
  })
})

export default TeamPromptResponseStage
