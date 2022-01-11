import {GraphQLBoolean, GraphQLID, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting, resolveTask} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'
import Task from './Task'

const SetTaskHighlightPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'SetTaskHighlightPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    meetingId: {
      type: GraphQLID
    },
    taskId: {
      type: GraphQLID
    },
    task: {
      type: Task,
      resolve: resolveTask
    },
    isHighlighted: {
      type: GraphQLBoolean
    }
  })
})

export default SetTaskHighlightPayload
