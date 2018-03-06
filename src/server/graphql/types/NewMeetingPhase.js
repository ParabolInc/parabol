import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql';
import {CHECKIN, DISCUSS, GROUP, THINK, VOTE} from 'universal/utils/constants';
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum';
import CheckInPhase from 'server/graphql/types/CheckInPhase';
import GenericMeetingPhase from 'server/graphql/types/GenericMeetingPhase';
import ThinkPhase from 'server/graphql/types/ThinkPhase';
import DiscussPhase from 'server/graphql/types/DiscussPhase';

export const newMeetingPhaseFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  phaseType: {
    type: NewMeetingPhaseTypeEnum,
    description: 'The type of phase'
  }
});

const resolveTypeLookup = {
  [CHECKIN]: CheckInPhase,
  [THINK]: ThinkPhase,
  [GROUP]: GenericMeetingPhase,
  [VOTE]: GenericMeetingPhase,
  [DISCUSS]: DiscussPhase
};

const NewMeetingPhase = new GraphQLInterfaceType({
  name: 'NewMeetingPhase',
  fields: newMeetingPhaseFields,
  resolveType: ({phaseType}) => resolveTypeLookup[phaseType]
});

export default NewMeetingPhase;
