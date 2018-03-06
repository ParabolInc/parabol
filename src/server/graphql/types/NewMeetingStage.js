import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql';
import NewMeeting from 'server/graphql/types/NewMeeting';
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum';
import {CHECKIN, DISCUSS, GROUP, THINK, VOTE} from 'universal/utils/constants';
import TeamMemberStage from 'server/graphql/types/TeamMemberStage';
import GenericMeetingStage from 'server/graphql/types/GenericMeetingStage';

/*
 * Each meeting has many phases.
 * Each phase has 1 or more stages.
 * Each stage is an "instance" of a phase item type.
 * By instance, I mean it combines the phase item with meeting-specific state, like an instantiated class
 * A generic phase item (eg a Check-in) is created by parabol-defined server logic
 * A custom phase item (eg the Retrospective categories like 4Ls or Start, Stop, Continue) is defined by the team
 * Each type of meeting has type-specific state (see NewMeeting)
 * Each phase of each meeting has phase-specific state (see NewMeetingPhase)
 * Each stage that belongs to a phase has stage-specific logic (see below)
 */

export const newMeetingStageFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  meetingId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key. try using meeting'
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
  phaseType: {
    description: 'The type of the phase',
    type: NewMeetingPhaseTypeEnum
  },
  isViewOnce: {
    description: 'true if the meeting phase can only be viewed once (eg first call)',
    type: GraphQLBoolean
  },
  isAutoAdvanced: {
    description: 'true if the meeting phase automatically advances to the next (eg Phase1.part2 completes when part1 completes)',
    type: GraphQLBoolean
  }
});

const resolveTypeLookup = {
  [CHECKIN]: TeamMemberStage,
  [THINK]: GenericMeetingStage,
  [GROUP]: GenericMeetingStage,
  [VOTE]: GenericMeetingStage,
  [DISCUSS]: GenericMeetingStage
};

const NewMeetingStage = new GraphQLInterfaceType({
  name: 'NewMeetingStage',
  description: 'An instance of a meeting phase item. On the client, this usually represents a single view',
  fields: newMeetingStageFields,
  resolveType: ({phaseType}) => resolveTypeLookup[phaseType]
});

export default NewMeetingStage;
