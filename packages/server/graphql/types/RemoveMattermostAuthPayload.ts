import {GraphQLID, GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import User from './User'
import {GQLContext} from '../graphql'

const RemoveMattermostAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveMattermostAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    teamId: {
      type: GraphQLID
    },
    user: {
      type: User,
      description: 'The user with updated mattermostAuth',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default RemoveMattermostAuthPayload
