import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import NewMeetingPhase, {newMeetingPhaseFields} from 'server/graphql/types/NewMeetingPhase';
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem';
import GenericMeetingStage from 'server/graphql/types/GenericMeetingStage';

const ReflectPhase = new GraphQLObjectType({
  name: 'ReflectPhase',
  description: 'The meeting phase where all team members check in one-by-one',
  interfaces: () => [NewMeetingPhase],
  fields: () => ({
    ...newMeetingPhaseFields(),
    focusedPhaseItemId: {
      type: GraphQLID,
      description: 'foreign key. use focusedPhaseItem'
    },
    focusedPhaseItem: {
      type: RetroPhaseItem,
      description: 'the phase item that the facilitator wants the group to focus on',
      resolve: ({focusedPhaseItemId}, args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(focusedPhaseItemId);
      }
    },
    stages: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GenericMeetingStage)))
    }
  })
});

export default ReflectPhase;
