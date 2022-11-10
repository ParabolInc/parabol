import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveGQLStagesFromPhase} from '../resolvers'
import GenericMeetingStage from './GenericMeetingStage'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'

const GenericMeetingPhase = new GraphQLObjectType<any, GQLContext>({
  name: 'GenericMeetingPhase',
  description: 'An all-purpose meeting phase with no extra state',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GenericMeetingStage))),
      resolve: resolveGQLStagesFromPhase
    }
  })
})

export default GenericMeetingPhase
