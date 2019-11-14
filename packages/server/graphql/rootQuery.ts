import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import User from './types/User'
import {getUserId} from '../utils/authorization'
import verifiedInvitation from './queries/verifiedInvitation'
import rateLimit from './rateLimit'
import getRethink from '../database/rethinkDriver'
import massInvitation from './queries/massInvitation'
import {GQLContext} from './graphql'
import SAMLIdP from './queries/SAMLIdP'
import getLastSeenAtURL from './queries/helpers/getLastSeenAtURL'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: User,
      resolve: async (_source, _args, {authToken, dataLoader}, info) => {
        const r = await getRethink()
        const viewerId = getUserId(authToken)
        const viewer = await dataLoader.get('users').load(viewerId)
        const {operation, variableValues} = info
        const {name} = operation
        if (name) {
          const {value} = name
          const lastSeenAtURL = getLastSeenAtURL(value, variableValues)
          if (lastSeenAtURL !== viewer.lastSeenAtURL) {
            viewer.lastSeenAtURL = lastSeenAtURL
            // no need to wait for the update since we've already got it in the cache
            r.table('User')
              .get(viewerId)
              .update({lastSeenAt: new Date(), lastSeenAtURL})
              .run()
          }
        }
        return viewer
      }
    },
    massInvitation,
    verifiedInvitation,
    authProviders: {
      args: {
        email: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'the email to see if it exists as an oauth account'
        }
      },
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      resolve: rateLimit({perMinute: 60, perHour: 240})(async (_source, {email}) => {
        const r = await getRethink()
        const users = await r
          .table('User')
          .getAll(email, {index: 'email'})
          .run()
        return users.map((user) => user.identities[0].provider)
      })
    },
    SAMLIdP
  })
})
