import {GraphQLInterfaceType} from 'graphql'
import {resolveOrganization} from '../resolvers'
import Organization from './Organization'
import SetOrgUserRoleAddedPayload from './SetOrgUserRoleAddedPayload'
import SetOrgUserRoleRemovedPayload from './SetOrgUserRoleRemovedPayload'
import StandardMutationError from './StandardMutationError'
import OrganizationUser from './OrganizationUser'

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
    resolve: async ({organizationUserId}, _args, {dataLoader}) => {
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
