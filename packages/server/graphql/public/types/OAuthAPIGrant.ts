import type {Oauthscopeenum} from '../../../postgres/types/pg'
import {CipherId} from '../../../utils/CipherId'
import type {OAuthApiGrantResolvers} from '../resolverTypes'

export interface OAuthAPIGrantSource {
  id: number
  appName: string
  redirectUris: string[]
  scopes: Oauthscopeenum[]
  grantedOrgIds: string[] | null
  grantedTeamIds: string[] | null
  grantedPageIds: string[] | null
  createdAt: Date
  lastUsedAt: Date | null
}

const OAuthAPIGrant: OAuthApiGrantResolvers = {
  id: ({id}) => CipherId.toClient(id, 'OAuthAPIGrant')
}

export default OAuthAPIGrant
