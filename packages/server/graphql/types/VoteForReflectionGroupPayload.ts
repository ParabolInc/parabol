import {GraphQLObjectType, GraphQLList, GraphQLNonNull} from 'graphql'
import {
  makeResolve,
  resolveMeetingMember,
  resolveNewMeeting,
  resolveUnlockedStages
} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import RetroReflectionGroup from './RetroReflectionGroup'
import RetrospectiveMeetingMember from './RetrospectiveMeetingMember'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import NewMeetingStage from './NewMeetingStage'
import {GQLContext} from '../graphql'

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
    },
    unlockedStages: {
      type: new GraphQLList(new GraphQLNonNull(NewMeetingStage)),
      description: 'The stages that were locked or unlocked by having at least 1 vote',
      resolve: resolveUnlockedStages
    }
  })
})

export default VoteForReflectionGroupPayload
