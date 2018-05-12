import {GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLInterfaceType, GraphQLNonNull} from 'graphql';
import NewMeeting from 'server/graphql/types/NewMeeting';
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum';
import {CHECKIN, DISCUSS, GROUP, REFLECT, VOTE} from 'universal/utils/constants';
import CheckInStage from 'server/graphql/types/CheckInStage';
import GenericMeetingStage from 'server/graphql/types/GenericMeetingStage';
import RetroDiscussStage from 'server/graphql/types/RetroDiscussStage';
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type';
import NewMeetingPhase from 'server/graphql/types/NewMeetingPhase';

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
  endAt: {
    description: 'The datetime the stage was completed',
    type: GraphQLISO8601Type
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
  isComplete: {
    type: GraphQLBoolean,
    description:
      'true if the facilitator has completed this stage, else false. Should be boolean(endAt)'
  },
  isNavigable: {
    type: GraphQLBoolean,
    description: 'true if any meeting participant can navigate to this stage'
  },
  isNavigableByFacilitator: {
    type: GraphQLBoolean,
    description: 'true if the facilitator can navigate to this stage'
  },
  phase: {
    type: NewMeetingPhase,
    description: 'The phase this stage belongs to',
    resolve: async ({meetingId, phaseType}, args, {dataLoader}) => {
      const meeting = await dataLoader.get('newMeetings').load(meetingId);
      const {phases} = meeting;
      return phases.find((phase) => phase.phaseType === phaseType);
    }
  },
  phaseType: {
    description: 'The type of the phase',
    type: NewMeetingPhaseTypeEnum
  },
  startAt: {
    description: 'The datetime the stage was started',
    type: GraphQLISO8601Type
  },
  viewCount: {
    description: 'Number of times the facilitator has visited this stage',
    type: GraphQLInt
  }
  // isViewOnce: {
  //   description: 'true if the meeting phase can only be viewed once (eg first call)',
  //   type: GraphQLBoolean
  // },
  // isAutoAdvanced: {
  //   description: 'true if the meeting phase automatically advances to the next (eg Phase1.part2 completes when part1 completes)',
  //   type: GraphQLBoolean
  // }
});

const NewMeetingStage = new GraphQLInterfaceType({
  name: 'NewMeetingStage',
  description:
    'An instance of a meeting phase item. On the client, this usually represents a single view',
  fields: newMeetingStageFields,
  resolveType: ({phaseType}) => {
    const resolveTypeLookup = {
      [CHECKIN]: CheckInStage,
      [REFLECT]: GenericMeetingStage,
      [GROUP]: GenericMeetingStage,
      [VOTE]: GenericMeetingStage,
      [DISCUSS]: RetroDiscussStage
    };
    return resolveTypeLookup[phaseType];
  }
});

export default NewMeetingStage;
