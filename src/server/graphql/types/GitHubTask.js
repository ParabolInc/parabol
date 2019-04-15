import {GraphQLInt, GraphQLObjectType, GraphQLString} from 'graphql'
import TaskIntegration, {taskIntegrationFields} from 'server/graphql/types/TaskIntegration'

const GitHubTask = new GraphQLObjectType({
  name: 'GitHubTask',
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

export default GitHubTask
