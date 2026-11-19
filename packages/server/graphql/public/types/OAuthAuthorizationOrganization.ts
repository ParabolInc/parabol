import type {Organization} from '../../../postgres/types'
import {getUserId} from '../../../utils/authorization'
import type {
  OAuthAuthorizationOrganizationResolvers,
  OAuthOrgBlockedReasonEnum
} from '../resolverTypes'

export interface OAuthAuthorizationOrganizationSource {
  organization: Organization
  blockedReason: OAuthOrgBlockedReasonEnum | null
}

const OAuthAuthorizationOrganization: OAuthAuthorizationOrganizationResolvers = {
  adminName: ({organization, blockedReason}, _args, {authToken, dataLoader}) => {
    if (!blockedReason) return null
    return dataLoader
      .get('earliestOrgAdminNameExcludingUser')
      .load({orgId: organization.id, userId: getUserId(authToken)})
  }
}

export default OAuthAuthorizationOrganization
