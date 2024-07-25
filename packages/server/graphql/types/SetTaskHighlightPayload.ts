import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import makeMutationPayload from './makeMutationPayload'

export const SetTaskHighlightSuccess = new GraphQLObjectType<
  {taskId: string; meetingId: string},
  GQLContext
>({
  name: 'SetTaskHighlightSuccess',
  fields: () => ({
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Meeting where the task is highlighted'
    },
    taskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Task which highlight changed'
    },
    task: {
      type: new GraphQLNonNull(Task),
      description: 'Task which highlight changed',
      resolve: resolveTask
    }
  })
})

const SetTaskHighlightPayload = makeMutationPayload(
  'SetTaskHighlightPayload',
  SetTaskHighlightSuccess
)

export default SetTaskHighlightPayload
