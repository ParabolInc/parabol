import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import GitHubTask from 'server/graphql/types/GitHubTask'
import TaskIntegrationJira from 'server/graphql/types/TaskIntegrationJira'
import TaskServiceEnum from 'server/graphql/types/TaskServiceEnum'
import {GITHUB} from 'universal/utils/constants'

export const taskIntegrationFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  },
  service: {
    type: new GraphQLNonNull(TaskServiceEnum)
  }
})

const resolveTypeLookup = {
  [GITHUB]: GitHubTask,
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
