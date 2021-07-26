import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull} from 'graphql'
import AddOrDeleteEnum from './AddOrDeleteEnum'
import TaskServiceEnum from './TaskServiceEnum'

const UpdatePokerScopeItemInput = new GraphQLInputObjectType({
  name: 'UpdatePokerScopeItemInput',
  fields: () => ({
    service: {
      type: GraphQLNonNull(TaskServiceEnum),
      description:
        'The location of the single source of truth (e.g. a jira-integrated parabol task would be "jira")'
    },
    serviceTaskId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'If vanilla parabol task, taskId. If integrated parabol task, integrationHash'
    },
    action: {
      type: GraphQLNonNull(AddOrDeleteEnum),
      description: 'The action to perform'
    }
  })
})

export default UpdatePokerScopeItemInput
