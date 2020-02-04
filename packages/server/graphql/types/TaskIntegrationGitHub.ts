import {GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql'
import TaskIntegration, {taskIntegrationFields} from './TaskIntegration'
import {GQLContext} from '../graphql'

const TaskIntegrationGitHub = new GraphQLObjectType<any, GQLContext>({
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
