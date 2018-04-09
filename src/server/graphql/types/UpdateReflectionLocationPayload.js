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
    reflectionGroup: {
      type: RetroReflectionGroup,
      description: 'The group encapsulating the new reflection. A new one was created if one was not provided.',
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    },
    oldReflectionGroup: {
      type: RetroReflectionGroup,
      description: 'The old group the reflection was in',
      resolve: makeResolve('oldReflectionGroupId', 'oldReflectionGroup', 'retroReflectionGroups')
    }
  })
});

export default UpdateReflectionLocationPayload;
