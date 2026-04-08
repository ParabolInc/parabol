import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {selectPersonalAccessToken} from '../../../postgres/select'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

export const updatePersonalAccessToken: MutationResolvers['updatePersonalAccessToken'] = async (
  _,
  {tokenId, label, scopes, grantedOrgIds, grantedTeamIds, grantedPageIds, expiresAt, revoke},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const prefix = tokenId.slice('pat_'.length)

  const token = await selectPersonalAccessToken()
    .where('prefix', '=', prefix)
    .where('userId', '=', viewerId)
    .executeTakeFirst()
  if (!token) throw new GraphQLError('Token not found')
  if (scopes && scopes.length === 0) throw new GraphQLError('Must have at least 1 scope')

  const pg = getKysely()
  await pg
    .updateTable('PersonalAccessToken')
    .set({
      ...(label !== undefined && label !== null ? {label} : {}),
      ...(scopes !== undefined && scopes !== null ? {scopes} : {}),
      ...(grantedOrgIds !== undefined ? {grantedOrgIds} : {}),
      ...(grantedTeamIds !== undefined ? {grantedTeamIds} : {}),
      ...(grantedPageIds !== undefined ? {grantedPageIds} : {}),
      ...(expiresAt !== undefined && expiresAt !== null ? {expiresAt} : {}),
      ...(revoke ? {revokedAt: new Date()} : {})
    })
    .where('id', '=', token.id)
    .execute()

  return {patId: token.id}
}

export default updatePersonalAccessToken
