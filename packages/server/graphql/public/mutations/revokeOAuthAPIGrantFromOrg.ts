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
  const grant = await dataLoader.get('oauthAPIGrants').loadNonNull(dbGrantId)
  const [provider, organizationUsers] = await Promise.all([
    getKysely()
      .selectFrom('OAuthAPIProvider')
      .select('orgId')
      .where('clientId', '=', grant.clientId)
      .executeTakeFirst(),
    dataLoader.get('organizationUsersByUserId').load(grant.userId)
  ])
  const currentOrgIds = organizationUsers.map((organizationUser) => organizationUser.orgId)
  const reachesOrg = grant.grantedOrgIds
    ? grant.grantedOrgIds.includes(orgId)
    : currentOrgIds.includes(orgId)
  if (grant.revokedAt || !provider || provider.orgId || !reachesOrg) {
    throw new GraphQLError('That connection does not reach this organization', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const remainingOrgIds = (grant.grantedOrgIds ?? currentOrgIds).filter(
    (grantedOrgId) => grantedOrgId !== orgId
  )
  const hasNoAccessLeft = remainingOrgIds.length === 0 && !grant.personalGrantedAt
  await getKysely()
    .updateTable('OAuthAPIGrant')
    .set({
      grantedOrgIds: remainingOrgIds,
      ...(hasNoAccessLeft ? {revokedAt: sql`CURRENT_TIMESTAMP`} : {})
    })
    .where('id', '=', dbGrantId)
    .execute()
  dataLoader.get('oauthAPIGrants').clear(dbGrantId)
  return {orgId}
}

export default revokeOAuthAPIGrantFromOrg
