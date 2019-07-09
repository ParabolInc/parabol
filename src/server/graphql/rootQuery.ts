import {GraphQLList, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import User from 'server/graphql/types/User'
import {getUserId} from 'server/utils/authorization'
import verifiedInvitation from 'server/graphql/queries/verifiedInvitation'
import rateLimit from 'server/graphql/rateLimit'
import getRethink from 'server/database/rethinkDriver'
import massInvitation from 'server/graphql/queries/massInvitation'

export default new GraphQLObjectType({
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
      resolve: rateLimit({perMinute: 2, perHour: 8})(async (_source, {email}) => {
        const r = getRethink()
        const users = await r.table('User').getAll(email, {index: 'email'})
        return users.map((user) => user.identities[0].provider)
      })
    }
  })
})
