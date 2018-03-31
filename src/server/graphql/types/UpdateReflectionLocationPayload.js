import {GraphQLObjectType} from 'graphql';
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import NewMeeting from 'server/graphql/types/NewMeeting';
import RetroReflection from 'server/graphql/types/RetroReflection';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';

const UpdateReflectionLocationPayload = new GraphQLObjectType({
  name: 'UpdateReflectionLocationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    reflection: {
      type: RetroReflection,
      resolve: makeResolve('reflectionId', 'reflection', 'retroReflections')
    },
    removedGroup: {
      type: RetroReflectionGroup,
      description: 'If the reflection was removed from a group & was the penultimate in the group, the group was removed, too',
      resolve: makeResolve('removedGroupId', 'removedGroup', 'retroReflectionGroups')
    }
  })
});

export default UpdateReflectionLocationPayload;
