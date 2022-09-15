import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveNewMeeting} from '../resolvers'
import NewMeeting from './NewMeeting'
import RetroReflection from './RetroReflection'
import StandardMutationError from './StandardMutationError'

const UpdateReflectionContentPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateReflectionContentPayload',
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
    }
  })
})

export default UpdateReflectionContentPayload
