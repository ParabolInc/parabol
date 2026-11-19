import {isClientMetadataDocumentUrl} from '../../../oauth2/validateClientMetadataDocument'
import type {Oauthscopeenum} from '../../../postgres/types/pg'
import {CipherId} from '../../../utils/CipherId'
import isValid from '../../isValid'
import type {OAuthApiGrantResolvers} from '../resolverTypes'

export interface OAuthAPIGrantSource {
  id: number
  clientId: string
  userId: string
  scopes: Oauthscopeenum[]
  grantedOrgIds: string[] | null
  personalGrantedAt: Date | null
  createdAt: Date
  lastUsedAt: Date | null
  clientName: string
  clientVerifiedAt: Date | null
  redirectUris: string[]
}

const OAuthAPIGrant: OAuthApiGrantResolvers = {
  id: ({id}) => CipherId.toClient(id, 'OAuthAPIGrant'),
  clientHost: ({clientId, redirectUris}) =>
    new URL(isClientMetadataDocumentUrl(clientId) ? clientId : redirectUris[0]!).host,
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId),
  grantedOrganizations: async ({grantedOrgIds, userId}, _args, {dataLoader}) => {
    if (!grantedOrgIds) return null
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const currentOrgIds = new Set(organizationUsers.map(({orgId}) => orgId))
    const orgs = await dataLoader
      .get('organizations')
      .loadMany(grantedOrgIds.filter((orgId) => currentOrgIds.has(orgId)))
    return orgs.filter(isValid)
  }
}

export default OAuthAPIGrant
