import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import SlackIntegration from './SlackIntegration'
import StandardMutationError from './StandardMutationError'
import User from './User'

const AddSlackAuthPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AddSlackAuthPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    slackIntegration: {
      type: SlackIntegration,
      description: 'The newly created auth',
      resolve: async ({slackAuthId}, _args: unknown, {dataLoader}: GQLContext) => {
        return dataLoader.get('slackAuths').load(slackAuthId)
      }
    },
    user: {
      type: User,
      description: 'The user with updated slackAuth',
      resolve: ({userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('users').load(userId)
      }
    }
  })
})

export default AddSlackAuthPayload
