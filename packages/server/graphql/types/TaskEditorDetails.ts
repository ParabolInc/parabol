import {GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {GQLContext} from '../graphql'

const TaskEditorDetails = new GraphQLObjectType<any, GQLContext>({
  name: 'TaskEditorDetails',
  fields: () => ({
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The userId of the person editing the task'
    },
    preferredName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the userId editing the task'
    }
  })
})

export default TaskEditorDetails
