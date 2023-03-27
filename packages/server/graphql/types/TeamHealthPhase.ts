import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import TeamHealthStage from './TeamHealthStage'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'

const TeamHealthPhase: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamHealthPhase',
  description: 'The meeting phase where all team members vote on their happiness',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamHealthStage))),
      resolve: resolveGQLStagesFromPhase
    }
  })
})

export default TeamHealthPhase
