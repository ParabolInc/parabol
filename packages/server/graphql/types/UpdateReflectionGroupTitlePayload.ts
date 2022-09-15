import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {makeResolve, resolveNewMeeting} from '../resolvers'
import NewMeeting from './NewMeeting'
import RetroReflectionGroup from './RetroReflectionGroup'
import StandardMutationError from './StandardMutationError'

const UpdateReflectionGroupTitlePayload = new GraphQLObjectType<any, GQLContext>({
  name: 'UpdateReflectionGroupTitlePayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    reflectionGroup: {
      type: RetroReflectionGroup,
      resolve: makeResolve('reflectionGroupId', 'reflectionGroup', 'retroReflectionGroups')
    }
  })
})

export default UpdateReflectionGroupTitlePayload
