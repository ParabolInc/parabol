import isAIAppAllowedByOrg from '../../../oauth2/isAIAppAllowedByOrg'
import {isClientMetadataDocumentUrl} from '../../../oauth2/validateClientMetadataDocument'
import type {Organization} from '../../../postgres/types'
import type {Oauthscopeenum} from '../../../postgres/types/pg'
import isValid from '../../isValid'
import type {OAuthAuthorizationRequestResolvers} from '../resolverTypes'

export interface OAuthAuthorizationRequestSource {
  name: string
  clientId: string
  orgId: string | null
  verifiedAt: Date | null
  scopes: Oauthscopeenum[]
  redirectUri: string
  userId: string
}

const getBlockedReason = (organization: Organization, provider: {verifiedAt: Date | null}) => {
  if (isAIAppAllowedByOrg(organization, provider)) return null
  const allowsVerifiedApps = isAIAppAllowedByOrg(organization, {verifiedAt: new Date()})
  return allowsVerifiedApps ? 'VERIFIED_ONLY' : 'NO_APPS'
}

const OAuthAuthorizationRequest: OAuthAuthorizationRequestResolvers = {
  organization: ({orgId}, _args, {dataLoader}) =>
    orgId ? dataLoader.get('organizations').loadNonNull(orgId) : null,
  clientHost: ({clientId, redirectUri}) =>
    new URL(isClientMetadataDocumentUrl(clientId) ? clientId : redirectUri).host,
  organizations: async ({orgId, verifiedAt, userId}, _args, {dataLoader}) => {
    if (orgId) return []
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const organizations = await dataLoader
      .get('organizations')
      .loadMany(organizationUsers.map((organizationUser) => organizationUser.orgId))
    return organizations
      .filter(isValid)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((organization) => ({
        organization,
        blockedReason: getBlockedReason(organization, {verifiedAt})
      }))
  }
}

export default OAuthAuthorizationRequest
