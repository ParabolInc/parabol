import {GraphQLID, GraphQLNonNull} from 'graphql'
import {getUserId, isSuperUser} from '../../utils/authorization'
import Organization from '../types/Organization'
import {GQLContext} from './../graphql'

export default {
  type: Organization,
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the orgId'
    }
  },
  description: 'get a single organization',
  resolve: async (
    _source: unknown,
    {orgId}: {orgId: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const [organization, viewerOrganizationUser] = await Promise.all([
      dataLoader.get('organizations').load(orgId),
      dataLoader.get('organizationUsersByUserIdOrgId').load({userId: viewerId, orgId})
    ])
    if (!isSuperUser(authToken) && !viewerOrganizationUser) return null
    return organization
  }
} as any
