import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import type {Oauthscopeenum} from '../postgres/types/pg'

const selectAIAppGrants = () =>
  getKysely()
    .selectFrom('OAuthAPIGrant')
    .innerJoin('OAuthAPIProvider', 'OAuthAPIProvider.clientId', 'OAuthAPIGrant.clientId')
    .where('OAuthAPIGrant.revokedAt', 'is', null)
    .where('OAuthAPIProvider.orgId', 'is', null)
    .select([
      'OAuthAPIGrant.id',
      'OAuthAPIGrant.clientId',
      'OAuthAPIGrant.userId',
      'OAuthAPIGrant.grantedOrgIds',
      'OAuthAPIGrant.personalGrantedAt',
      'OAuthAPIGrant.createdAt',
      'OAuthAPIGrant.lastUsedAt',
      'OAuthAPIProvider.name as clientName',
      'OAuthAPIProvider.verifiedAt as clientVerifiedAt',
      'OAuthAPIProvider.redirectUris'
    ])
    .select(sql<Oauthscopeenum[]>`to_json("OAuthAPIGrant"."scopes")`.as('scopes'))

export const selectAIAppGrantsReachingOrg = (orgId: string) =>
  selectAIAppGrants()
    .where(
      sql<boolean>`(${orgId} = ANY("OAuthAPIGrant"."grantedOrgIds") OR "OAuthAPIGrant"."grantedOrgIds" IS NULL)`
    )
    .where(({exists, selectFrom}) =>
      exists(
        selectFrom('OrganizationUser')
          .select('OrganizationUser.id')
          .whereRef('OrganizationUser.userId', '=', 'OAuthAPIGrant.userId')
          .where('OrganizationUser.orgId', '=', orgId)
          .where('OrganizationUser.removedAt', 'is', null)
      )
    )

export default selectAIAppGrants
