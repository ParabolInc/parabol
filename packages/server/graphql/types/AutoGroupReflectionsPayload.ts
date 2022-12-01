import {GraphQLList, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveNewMeeting} from '../resolvers'
import RetroReflection from './RetroReflection'
import RetroReflectionGroup from './RetroReflectionGroup'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import StandardMutationError from './StandardMutationError'

const AutoGroupReflectionsPayload = new GraphQLObjectType<any, GQLContext>({
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
      resolve: makeResolve('reflectionIds', 'reflections', 'retroReflections', true)
    },
    reflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup),
      resolve: makeResolve('reflectionGroupIds', 'reflectionGroups', 'retroReflectionGroups', true)
    },
    removedReflectionGroups: {
      type: new GraphQLList(RetroReflectionGroup),
      resolve: makeResolve(
        'removedReflectionGroupIds',
        'removedReflectionGroups',
        'retroReflectionGroups',
        true
      )
    }
  })
})

export default AutoGroupReflectionsPayload
