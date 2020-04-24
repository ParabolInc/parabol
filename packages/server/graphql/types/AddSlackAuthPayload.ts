import {GraphQLObjectType} from 'graphql'
import StandardMutationError from './StandardMutationError'
import SlackAuth from './SlackAuth'
import User from './User'
import {GQLContext} from '../graphql'

const AddSlackAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddSlackAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    slackAuth: {
      type: SlackAuth,
      description: 'The newly created auth',
      resolve: async ({slackAuthId}, _args, {dataLoader}: GQLContext) => {
        return dataLoader.get('slackAuths').load(slackAuthId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated slackAuth',
      resolve: ({userId}, _args, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default AddSlackAuthPayload
