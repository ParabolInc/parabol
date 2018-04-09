import {GraphQLObjectType} from 'graphql';
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import NewMeeting from 'server/graphql/types/NewMeeting';
import RetroReflection from 'server/graphql/types/RetroReflection';
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup';

const CreateReflectionPayload = new GraphQLObjectType({
  name: 'CreateReflectionPayload',
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
      description: 'The group automatically created for the reflection',
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    }
  })
});

export default CreateReflectionPayload;
