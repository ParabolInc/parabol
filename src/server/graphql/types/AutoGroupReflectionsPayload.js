import {GraphQLList, GraphQLObjectType} from 'graphql'
import {makeResolve, resolveNewMeeting} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup'
import RetroReflection from 'server/graphql/types/RetroReflection'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'

const AutoGroupReflectionsPayload = new GraphQLObjectType({
  name: 'AutoGroupReflectionsPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: RetrospectiveMeeting,
      resolve: resolveNewMeeting
    },
    reflections: {
      type: new GraphQLList(RetroReflection),
      resolve: makeResolve('reflectionIds', 'reflections', 'retroReflections')
    },
    reflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup),
      resolve: makeResolve('reflectionGroupIds', 'reflectionGroups', 'retroReflectionGroups')
    }
  })
})

export default AutoGroupReflectionsPayload
