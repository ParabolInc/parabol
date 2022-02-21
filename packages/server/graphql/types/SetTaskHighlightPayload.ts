import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const SetTaskHighlightSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'SetTaskHighlightSuccess',
  fields: () => ({
    meetingId: {
      type: GraphQLID,
      description: 'Meeting where the task is highlighted'
    },
    taskId: {
      type: GraphQLID,
      description: 'Task which highlight changed'
    },
    isHighlighted: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Is the task highlighted?'
    }
  })
})

const SetTaskHighlightPayload = makeMutationPayload(
  'SetTaskHighlightPayload',
  SetTaskHighlightSuccess
)

export default SetTaskHighlightPayload
