import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveNewMeeting, resolveUnlockedStages} from '../resolvers'
import NewMeeting from './NewMeeting'
import NewMeetingStage from './NewMeetingStage'
import RetroReflection from './RetroReflection'
import RetroReflectionGroup from './RetroReflectionGroup'
import StandardMutationError from './StandardMutationError'

const CreateReflectionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'CreateReflectionPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    reflectionId: {
      type: GraphQLID
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
