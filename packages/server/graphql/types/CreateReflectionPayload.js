import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {makeResolve, resolveNewMeeting, resolveUnlockedStages} from 'server/graphql/resolvers'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import RetroReflection from 'server/graphql/types/RetroReflection'
import RetroReflectionGroup from 'server/graphql/types/RetroReflectionGroup'
import NewMeetingStage from 'server/graphql/types/NewMeetingStage'

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
    },
    unlockedStages: {
      type: new GraphQLList(new GraphQLNonNull(NewMeetingStage)),
      description: 'The stages that were unlocked by navigating',
      resolve: resolveUnlockedStages
    }
  })
})

export default CreateReflectionPayload
