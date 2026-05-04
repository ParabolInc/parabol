import {GraphQLError} from 'graphql'
import ms from 'ms'
import getKysely from '../../../postgres/getKysely'
import {selectPersonalAccessToken} from '../../../postgres/select'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

export const updatePersonalAccessToken: MutationResolvers['updatePersonalAccessToken'] = async (
  _,
  {
    tokenId,
    name: tokenName,
    scopes,
    grantedOrgIds,
    grantedTeamIds,
    grantedPageIds,
    expiresAt,
    revoke
  },
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const prefix = tokenId.slice('pat_'.length)

  const token = await selectPersonalAccessToken()
    .where('prefix', '=', prefix)
    .where('userId', '=', viewerId)
    .executeTakeFirst()
  if (!token) throw new GraphQLError('Token not found')
  if (token.revokedAt) throw new GraphQLError('Token has been revoked')
  if (scopes && scopes.length === 0) throw new GraphQLError('Must have at least 1 scope')
  if (tokenName && tokenName.length > 255) {
    throw new GraphQLError('Name cannot be more than 255 characters')
  }
  if (grantedOrgIds && grantedOrgIds.length > 100) {
    throw new GraphQLError('Cannot grant access to more than 100 organizations')
  }
  if (grantedTeamIds && grantedTeamIds.length > 100) {
    throw new GraphQLError('Cannot grant access to more than 100 teams')
  }
  if (grantedPageIds && grantedPageIds.length > 100) {
    throw new GraphQLError('Cannot grant access to more than 100 pages')
  }
  const maxExpiry = new Date(Date.now() + ms('1y'))
  if (expiresAt && expiresAt > maxExpiry) {
    throw new GraphQLError('Expiration date cannot be more than 1 year in the future')
  }
  const pg = getKysely()
  await pg
    .updateTable('PersonalAccessToken')
    .set({
      ...(tokenName !== undefined && tokenName !== null ? {name: tokenName} : {}),
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
