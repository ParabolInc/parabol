import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import TeamPromptResponseStage from './TeamPromptResponseStage'

const TeamPromptResponsesPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptResponsesPhase',
  description: 'The meeting phase where each of the team members can respond to prompts',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamPromptResponseStage))),
      resolve: resolveGQLStagesFromPhase
    }
  })
})

export default TeamPromptResponsesPhase
