import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import User from './User'
import {GQLContext} from '../graphql'
import makeMutationPayload from './makeMutationPayload'

export const RemoveMattermostAuthSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveMattermostAuthSuccess',
  fields: () => ({
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The team with updated mattermost auth'
    },
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user with updated mattermost auth',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

const RemoveMattermostAuthPayload = makeMutationPayload(
  'RemoveMattermostAuthPayload',
  RemoveMattermostAuthSuccess
)

export default RemoveMattermostAuthPayload
