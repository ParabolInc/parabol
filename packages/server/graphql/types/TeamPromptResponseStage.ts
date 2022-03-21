import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import {GQLContext} from '../graphql'
import DiscussionThreadStage, {discussionThreadStageFields} from './DiscussionThreadStage'
import NewMeetingStage, {newMeetingStageFields} from './NewMeetingStage'
import TeamPromptResponse from './TeamPromptResponse'

const TeamPromptResponseStage = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptResponseStage',
  description: 'The stage where the single team member responds to a prompt',
  interfaces: () => [NewMeetingStage, DiscussionThreadStage],
  isTypeOf: ({phaseType}) => (phaseType as NewMeetingPhaseTypeEnum) === 'RESPONSES',
  fields: () => ({
    ...newMeetingStageFields(),
    ...discussionThreadStageFields(),
    agendaItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The id of the agenda item this relates to'
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
