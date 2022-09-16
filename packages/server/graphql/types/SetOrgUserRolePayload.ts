import {GraphQLInterfaceType} from 'graphql'
import {resolveOrganization} from '../resolvers'
import {GQLContext} from './../graphql'
import Organization from './Organization'
import OrganizationUser from './OrganizationUser'
import SetOrgUserRoleAddedPayload from './SetOrgUserRoleAddedPayload'
import SetOrgUserRoleRemovedPayload from './SetOrgUserRoleRemovedPayload'
import StandardMutationError from './StandardMutationError'

export const setOrgUserRoleFields = {
  error: {
    type: StandardMutationError
  },
  organization: {
    type: Organization,
    resolve: resolveOrganization
  },
  updatedOrgMember: {
    type: OrganizationUser,
    resolve: async (
      {organizationUserId}: {organizationUserId: string},
      _args: unknown,
      {dataLoader}: GQLContext
    ) => {
      return dataLoader.get('organizationUsers').load(organizationUserId)
    }
  }
}

const SetOrgUserRolePayload = new GraphQLInterfaceType({
  name: 'SetOrgUserRolePayload',
  resolveType: ({notificationIdsAdded}) => {
    return notificationIdsAdded ? SetOrgUserRoleAddedPayload : SetOrgUserRoleRemovedPayload
  },
  fields: () => ({
    ...setOrgUserRoleFields
  })
})

export default SetOrgUserRolePayload
