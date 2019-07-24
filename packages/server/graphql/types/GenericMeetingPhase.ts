import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import NewMeetingPhase, {newMeetingPhaseFields} from './NewMeetingPhase'
import GenericMeetingStage from './GenericMeetingStage'

const GenericMeetingPhase = new GraphQLObjectType({
  name: 'GenericMeetingPhase',
  description: 'An all-purpose meeting phase with no extra state',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GenericMeetingStage)))
    }
  })
})

export default GenericMeetingPhase
