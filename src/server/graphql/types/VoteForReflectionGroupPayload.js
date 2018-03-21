import {GraphQLObjectType} from 'graphql';
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import NewMeeting from 'server/graphql/types/NewMeeting';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId';
import MeetingMember from 'server/graphql/types/MeetingMember';

const VoteForReflectionGroupPayload = new GraphQLObjectType({
  name: 'VoteForReflectionGroupPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    reflectionGroup: {
      type: RetroReflectionGroup,
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    },
    meetingMember: {
      type: MeetingMember,
      resolve: ({meetingId, userId}, args, {dataLoader}) => {
        const meetingMemberId = toTeamMemberId(meetingId, userId);
        return dataLoader.get('meetingMembers').load(meetingMemberId);
      }
    }
  })
});

export default VoteForReflectionGroupPayload;
