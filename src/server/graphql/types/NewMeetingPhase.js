import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import NewMeeting from 'server/graphql/types/NewMeeting';
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum';
import CustomPhaseItem from 'server/graphql/types/CustomPhaseItem';

const NewMeetingPhase = new GraphQLObjectType({
  name: 'NewMeetingPhase',
  description: 'A meeting phase. On the client, this usually represents a single view',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    meeting: {
      type: NewMeeting,
      description: 'The meeting this phase belongs to',
      resolve: ({meetingId}, args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId);
      }
    },
    isComplete: {
      type: GraphQLBoolean,
      description: 'true if the facilitator has completed this phase, else false'
    },
    type: {
      description: 'The type of the phase',
      type: NewMeetingPhaseTypeEnum
    },
    customPhaseItem: {
      description: 'The phase item that this phase represents',
      type: CustomPhaseItem,
      resolve: ({customPhaseItemId}, args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(customPhaseItemId);
      }
    }
  })
});

export default NewMeetingPhase;
