import type {Organization} from '../../../postgres/types'
import type {
  OAuthAuthorizationOrganizationResolvers,
  OAuthOrgBlockedReasonEnum
} from '../resolverTypes'

export interface OAuthAuthorizationOrganizationSource {
  organization: Organization
  blockedReason: OAuthOrgBlockedReasonEnum | null
}

const OAuthAuthorizationOrganization: OAuthAuthorizationOrganizationResolvers = {
  adminName: async ({organization, blockedReason}, _args, {dataLoader}) => {
    if (!blockedReason) return null
    const organizationUsers = await dataLoader.get('organizationUsersByOrgId').load(organization.id)
    const [earliestAdmin] = organizationUsers
      .filter(({role}) => role === 'ORG_ADMIN')
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())
    if (!earliestAdmin) return null
    const admin = await dataLoader.get('users').load(earliestAdmin.userId)
    return admin?.preferredName ?? null
  }
}

export default OAuthAuthorizationOrganization
