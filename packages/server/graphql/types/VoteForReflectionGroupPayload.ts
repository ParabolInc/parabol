import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveMeetingMember, resolveNewMeeting} from '../resolvers'
import RetroReflectionGroup from './RetroReflectionGroup'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import RetrospectiveMeetingMember from './RetrospectiveMeetingMember'
import StandardMutationError from './StandardMutationError'

const VoteForReflectionGroupPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'VoteForReflectionGroupPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: RetrospectiveMeeting,
      resolve: resolveNewMeeting
    },
    meetingMember: {
      type: RetrospectiveMeetingMember,
      resolve: resolveMeetingMember
    },
    reflectionGroup: {
      type: RetroReflectionGroup,
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    }
  })
})

export default VoteForReflectionGroupPayload
