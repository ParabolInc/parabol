import {GraphQLInterfaceType} from 'graphql'
import {resolveOrganization} from 'server/graphql/resolvers'
import Organization from 'server/graphql/types/Organization'
import OrganizationMember from 'server/graphql/types/OrganizationMember'
import SetOrgUserRoleAddedPayload from 'server/graphql/types/SetOrgUserRoleAddedPayload'
import SetOrgUserRoleRemovedPayload from 'server/graphql/types/SetOrgUserRoleRemovedPayload'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

export const setOrgUserRoleFields = {
  error: {
    type: StandardMutationError
  },
  organization: {
    type: Organization,
    resolve: resolveOrganization
  },
  updatedOrgMember: {
    type: OrganizationMember,
    // This feels weird, but it's the DRYest way
    resolve: (source) => source
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
