import {GQLContext} from './../graphql'
import {GraphQLID, GraphQLNonNull} from 'graphql'
import Organization from '../types/Organization'
import {getUserId} from '../../utils/authorization'
import OrganizationUser from '../../database/types/OrganizationUser'

export default {
  type: Organization,
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the orgId'
    }
  },
  description: 'get a single organization and the count of users by status',
  resolve: async (
    {id: userId}: {id: string},
    {orgId}: {orgId: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)

    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const organizationUser = organizationUsers.find(
      (organizationUser: OrganizationUser) => organizationUser.orgId === orgId
    )
    if (!organizationUser) return null
    const organization = await dataLoader.get('organizations').load(orgId)
    if (viewerId === userId) return organization

    const viewerOrganizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const viewerOrganizationUser = viewerOrganizationUsers.find(
      (organizationUser: OrganizationUser) => organizationUser.orgId === orgId
    )
    return viewerOrganizationUser ? organization : null
  }
} as any
