import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull, GraphQLString} from 'graphql'

const TaskEstimateInput = new GraphQLInputObjectType({
  name: 'TaskEstimateInput',
  fields: () => ({
    taskId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    value: {
      description: 'The new estimate value',
      type: new GraphQLNonNull(GraphQLString)
    },
    dimensionName: {
      description: 'The name of the estimate, e.g. Story Points',
      type: new GraphQLNonNull(GraphQLString)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  })
})

export interface ITaskEstimateInput {
  taskId: string
  value: string
  dimensionName: string
  meetingId: string
}
export default TaskEstimateInput
