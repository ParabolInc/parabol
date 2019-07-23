import {GraphQLObjectType, GraphQLList, GraphQLNonNull} from 'graphql'
import {
  makeResolve,
  resolveMeetingMember,
  resolveNewMeeting,
  resolveUnlockedStages
} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup'
import RetrospectiveMeetingMember from 'server/graphql/types/RetrospectiveMeetingMember'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'
import NewMeetingStage from 'server/graphql/types/NewMeetingStage'

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
