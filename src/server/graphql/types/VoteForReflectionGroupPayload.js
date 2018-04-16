import {GraphQLObjectType} from 'graphql';
import {makeResolve, resolveMeetingMember, resolveNewMeeting} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';
import RetrospectiveMeetingMember from 'server/graphql/types/RetrospectiveMeetingMember';
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting';

const VoteForReflectionGroupPayload = new GraphQLObjectType({
  name: 'VoteForReflectionGroupPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: RetrospectiveMeeting,
      resolve: resolveNewMeeting
    },
    reflectionGroup: {
      type: RetroReflectionGroup,
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    },
    meetingMember: {
      type: RetrospectiveMeetingMember,
      resolve: resolveMeetingMember
    }
  })
});

export default VoteForReflectionGroupPayload;
