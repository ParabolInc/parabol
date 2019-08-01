import {GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql'
import TaskIntegration, {taskIntegrationFields} from './TaskIntegration'

const TaskIntegrationGitHub = new GraphQLObjectType({
  name: 'TaskIntegrationGitHub',
  description: 'The details associated with a task integrated with GitHub',
  interfaces: () => [TaskIntegration],
  fields: () => ({
    ...taskIntegrationFields(),
    nameWithOwner: {
      type: GraphQLString
    },
    issueNumber: {
      type: GraphQLInt
    }
  })
})

export default TaskIntegrationGitHub
