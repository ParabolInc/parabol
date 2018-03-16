import {GraphQLObjectType} from 'graphql';
import NewMeeting from 'server/graphql/types/NewMeeting';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import {resolveNewMeeting} from 'server/graphql/resolvers';
import findStageById from 'universal/utils/meetings/findStageById';
import NewMeetingStage from 'server/graphql/types/NewMeetingStage';

const NavigateMeetingPayload = new GraphQLObjectType({
  name: 'NavigateMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    stageCompleted: {
      type: NewMeetingStage,
      description: 'The stage that was completed during this navigation event, if any',
      resolve: async ({meetingId, stageIdCompleted}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId);
        return findStageById(meeting.phases, stageIdCompleted);
      }
    }
  })
});

export default NavigateMeetingPayload;
