import {GraphQLInterfaceType} from 'graphql'
import {resolveOrganization} from 'server/graphql/resolvers'
import Organization from 'server/graphql/types/Organization'
import SetOrgUserRoleAddedPayload from 'server/graphql/types/SetOrgUserRoleAddedPayload'
import SetOrgUserRoleRemovedPayload from 'server/graphql/types/SetOrgUserRoleRemovedPayload'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import OrganizationUser from 'server/graphql/types/OrganizationUser'

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
