import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveNewMeeting, resolveUnlockedStages} from '../resolvers'
import NewMeeting from './NewMeeting'
import NewMeetingStage from './NewMeetingStage'
import RetroReflection from './RetroReflection'
import StandardMutationError from './StandardMutationError'

const RemoveReflectionPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveReflectionPayload',
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
    unlockedStages: {
      type: new GraphQLList(new GraphQLNonNull(NewMeetingStage)),
      description: 'The stages that were unlocked by navigating',
      resolve: resolveUnlockedStages
    }
  })
})

export default RemoveReflectionPayload
