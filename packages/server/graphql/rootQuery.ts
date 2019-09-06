import {GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import User from './types/User'
import {getUserId} from '../utils/authorization'
import verifiedInvitation from './queries/verifiedInvitation'
import rateLimit from './rateLimit'
import getRethink from '../database/rethinkDriver'
import massInvitation from './queries/massInvitation'
import {GQLContext} from './graphql'
import SAMLIdP from './queries/SAMLIdP'

export default new GraphQLObjectType<any, GQLContext>({
  name: 'Query',
  fields: () => ({
    viewer: {
      type: User,
      resolve: (_source, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        return dataLoader.get('users').load(viewerId)
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
        const r = getRethink()
        const users = await r.table('User').getAll(email, {index: 'email'})
        return users.map((user) => user.identities[0].provider)
      })
    },
    SAMLIdP
  })
})
