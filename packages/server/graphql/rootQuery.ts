import {GraphQLObjectType} from 'graphql'
import {getUserId} from '../utils/authorization'
import {GQLContext} from './graphql'
import getDemoEntities from './queries/getDemoEntitites'
import massInvitation from './queries/massInvitation'
import SAMLIdP from './queries/SAMLIdP'
import verifiedInvitation from './queries/verifiedInvitation'
import User from './types/User'
import * as Sentry from '@sentry/browser'
import LogRocket from 'logrocket'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: User,
      resolve: async (_source, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        if (!viewerId) {
          const error = new Error(
            `viewerId is null in User query. authToken: ${JSON.stringify(
              authToken
            )}. Timestamp: ${Math.floor(new Date().getTime() / 1000)}`
          )
          Sentry.captureException(error)
          LogRocket.captureException(error)
          return null
        }
        return dataLoader.get('users').load(viewerId)
      }
    },
    getDemoEntities,
    massInvitation,
    verifiedInvitation,
    SAMLIdP
  })
})
