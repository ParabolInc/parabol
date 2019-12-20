import {GraphQLObjectType} from 'graphql'
import getRethink from '../database/rethinkDriver'
import {getUserId} from '../utils/authorization'
import {GQLContext} from './graphql'
import getDemoEntities from './queries/getDemoEntitites'
import getLastSeenAtURL from './queries/helpers/getLastSeenAtURL'
import massInvitation from './queries/massInvitation'
import SAMLIdP from './queries/SAMLIdP'
import verifiedInvitation from './queries/verifiedInvitation'
import User from './types/User'

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
          if (lastSeenAtURL && lastSeenAtURL !== viewer.lastSeenAtURL) {
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
    getDemoEntities,
    massInvitation,
    verifiedInvitation,
    SAMLIdP
  })
})
