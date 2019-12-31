import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TaskIntegration, {taskIntegrationFields} from './TaskIntegration'

const TaskIntegrationAzureDevops = new GraphQLObjectType({
  name: 'TaskIntegrationAzureDevops',
  description: 'The details associated with a task integrated with Azure Devops',
  interfaces: () => [TaskIntegration],
  fields: () => ({
    ...taskIntegrationFields(),
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The project key used by Azure Devops as a more human readable proxy for a projectId'
    },
    projectName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The name of the project as defined by Azure Devops'
    },
    organization: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The organization that the project lives on'
    },
    workItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The work item id in Azure Devops'
    },
    cloudName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The psuedo-domain to use to generate a base url'
    }
  })
})

export default TaskIntegrationAzureDevops
