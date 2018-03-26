/**
 * The mutation/subscription payload for when a reflection's `isEditing`
 * state changes.
 *
 * @flow
 */
import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql';
import {resolveNewMeeting} from 'server/graphql/resolvers';
import StandardMutationError from 'server/graphql/types/StandardMutationError';
import NewMeeting from 'server/graphql/types/NewMeeting';

const RetroReflectionEditingState = new GraphQLObjectType({
  name: 'RetroReflectionEditingState',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isEditing: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  })
});

export default new GraphQLObjectType({
  name: 'UpdateReflectionIsEditingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    reflection: {
      type: RetroReflectionEditingState
    }
  })
});
