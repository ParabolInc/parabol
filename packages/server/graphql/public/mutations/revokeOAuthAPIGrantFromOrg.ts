import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../../utils/CipherId'
import type {MutationResolvers} from '../resolverTypes'

const revokeOAuthAPIGrantFromOrg: MutationResolvers['revokeOAuthAPIGrantFromOrg'] = async (
  _source,
  {grantId, orgId},
  {dataLoader}
) => {
  const [dbGrantId] = CipherId.fromClient(grantId)
  const remainingOrgIds = sql`array_remove(
    COALESCE(
      "grantedOrgIds",
      ARRAY(
        SELECT "orgId" FROM "OrganizationUser"
        WHERE "userId" = "OAuthAPIGrant"."userId" AND "removedAt" IS NULL
      )
    ),
    ${orgId}::varchar
  )`
  const {rows} = await sql<{id: number}>`
    UPDATE "OAuthAPIGrant"
    SET
      "grantedOrgIds" = ${remainingOrgIds},
      "revokedAt" = CASE
        WHEN cardinality(${remainingOrgIds}) = 0 AND "personalGrantedAt" IS NULL
        THEN CURRENT_TIMESTAMP
        ELSE "revokedAt"
      END
    WHERE "id" = ${dbGrantId}
      AND "revokedAt" IS NULL
      AND EXISTS (
        SELECT 1 FROM "OAuthAPIProvider"
        WHERE "OAuthAPIProvider"."clientId" = "OAuthAPIGrant"."clientId"
          AND "OAuthAPIProvider"."orgId" IS NULL
      )
      AND (${orgId} = ANY("grantedOrgIds") OR "grantedOrgIds" IS NULL)
      AND EXISTS (
        SELECT 1 FROM "OrganizationUser"
        WHERE "OrganizationUser"."userId" = "OAuthAPIGrant"."userId"
          AND "OrganizationUser"."orgId" = ${orgId}
          AND "OrganizationUser"."removedAt" IS NULL
      )
    RETURNING "id"
  `.execute(getKysely())
  if (rows.length === 0) {
    throw new GraphQLError('That connection does not reach this organization', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  dataLoader.get('oauthAPIGrants').clear(dbGrantId)
  return {orgId}
}

export default revokeOAuthAPIGrantFromOrg
