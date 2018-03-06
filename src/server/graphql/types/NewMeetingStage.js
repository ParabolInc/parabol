import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import NewMeeting from 'server/graphql/types/NewMeeting';
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum';
import CustomPhaseItem from 'server/graphql/types/CustomPhaseItem';

/*
 * This entity is a denormalization of a MeetingPhaseItem & a PhaseItemInstance.
 * a MeetingPhaseItem contains all the meeting-specific variables (eg isFacilitatorStage, isComplete)
 * a PhaseItemInstance contains rules on how to handle the phase item for the given phase (eg isSingleView, isAutoAdvanced)
 * By combining both into 1 entity, we reduce fidelity of the normalized form, but also reduce complexity
 * Additionally, we increase flexibility in case different meetings want to handle PhaseItemInstances differently
 */
const NewMeetingStage = new GraphQLObjectType({
  name: 'NewMeetingStage',
  description: 'An instance of a meeting phase item. On the client, this usually represents a single view',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    meeting: {
      type: NewMeeting,
      description: 'The meeting this stage belongs to',
      resolve: ({meetingId}, args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId);
      }
    },
    isFacilitatorStage: {
      type: GraphQLBoolean,
      description: 'true if the facilitator is currently looking at the stage, else false'
    },
    isComplete: {
      type: GraphQLBoolean,
      description: 'true if the facilitator has completed this stage, else false'
    },
    type: {
      description: 'The type of the phase',
      type: NewMeetingPhaseTypeEnum
    },
    isSingleView: {
      description: 'true if the meeting phase can only be viewed once (eg first call)',
      type: GraphQLBoolean
    },
    isAutoAdvanced: {
      description: 'true if the meeting phase automatically advances to the next (eg Phase1.part2 completes when part1 completes)',
      type: GraphQLBoolean
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

export default NewMeetingStage;
