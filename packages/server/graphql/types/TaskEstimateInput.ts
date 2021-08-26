import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'

const TaskEstimateInput = new GraphQLInputObjectType({
  name: 'TaskEstimateInput',
  fields: () => ({
    taskId: {
      type: GraphQLNonNull(GraphQLID)
    },
    value: {
      description: 'The new estimate value',
      type: GraphQLNonNull(GraphQLString)
    },
    dimensionName: {
      description: 'The name of the estimate, e.g. Story Points',
      type: GraphQLNonNull(GraphQLString)
    },
    meetingId: {
      type: GraphQLID
    }
  })
})

export interface ITaskEstimateInput {
  taskId: string
  value: string
  dimensionName: string
  meetingId?: string | null
}
export default TaskEstimateInput
