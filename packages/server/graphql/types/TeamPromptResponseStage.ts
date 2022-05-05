import {GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
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
      type: new GraphQLNonNull(TeamPromptResponse),
      description: 'The response to the prompt',
      resolve: () => {
        // TODO: implement fetching responses
        return {}
      }
    }
  })
})

export default TeamPromptResponseStage
