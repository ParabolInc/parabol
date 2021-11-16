import {GraphQLID, GraphQLInputObjectType, GraphQLNonNull} from 'graphql'
import AddOrDeleteEnum from './AddOrDeleteEnum'
import TaskServiceEnum from './TaskServiceEnum'

const UpdatePokerScopeItemInput = new GraphQLInputObjectType({
  name: 'UpdatePokerScopeItemInput',
  fields: () => ({
    service: {
      type: new GraphQLNonNull(TaskServiceEnum),
      description:
        'The location of the single source of truth (e.g. a jira-integrated parabol task would be "jira")'
    },
    serviceTaskId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'If vanilla parabol task, taskId. If integrated parabol task, integrationHash'
    },
    action: {
      type: new GraphQLNonNull(AddOrDeleteEnum),
      description: 'The action to perform'
    }
  })
})

export default UpdatePokerScopeItemInput
