import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import NewMeetingPhase, {newMeetingPhaseFields} from 'server/graphql/types/NewMeetingPhase';
import GenericMeetingStage from 'server/graphql/types/GenericMeetingStage';

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
});

export default GenericMeetingPhase;
