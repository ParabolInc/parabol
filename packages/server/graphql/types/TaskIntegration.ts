import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'

export const taskIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  }
})

const TaskIntegration = new GraphQLInterfaceType({
  name: 'TaskIntegration',
  fields: taskIntegrationFields,
  resolveType: (data) => {
    const resolveTypeLookup = {
      github: '_xGitHubIssue',
      jira: 'JiraIssue'
    }
    return resolveTypeLookup[data.service]
  }
})

export default TaskIntegration
