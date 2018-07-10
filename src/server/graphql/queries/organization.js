import {GraphQLID, GraphQLNonNull} from 'graphql'
import Organization from 'server/graphql/types/Organization'
import {getUserId} from 'server/utils/authorization'

export default {
  type: new GraphQLNonNull(Organization),
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the orgId'
    }
  },
  description: 'get a single organization and the count of users by status',
  resolve: async (source, {orgId}, {authToken, dataLoader}) => {
    // AUTH
    const viewerId = getUserId(authToken)
    const org = await dataLoader.get('organizations').load(orgId)

    const {orgUsers} = org
    const myOrgUser = orgUsers.find((user) => user.id === viewerId)
    if (!myOrgUser) {
      // silently fail if not in org
      return null
    }

    // RESOLUTION
    return org
  }
}
