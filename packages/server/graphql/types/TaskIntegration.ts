import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'

export const taskIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  }
})

const TaskIntegration = new GraphQLInterfaceType({
  name: 'TaskIntegration',
  fields: taskIntegrationFields
})

export default TaskIntegration
