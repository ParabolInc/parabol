import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import TaskIntegrationGitHub from 'server/graphql/types/TaskIntegrationGitHub'
import TaskIntegrationJira from 'server/graphql/types/TaskIntegrationJira'
import TaskServiceEnum from 'server/graphql/types/TaskServiceEnum'

export const taskIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  },
  service: {
    type: new GraphQLNonNull(TaskServiceEnum)
  }
})

const resolveTypeLookup = {
  github: TaskIntegrationGitHub,
  jira: TaskIntegrationJira
}

const TaskIntegration = new GraphQLInterfaceType({
  name: 'TaskIntegration',
  fields: taskIntegrationFields,
  resolveType (value) {
    return resolveTypeLookup[value.service]
  }
})

export default TaskIntegration
