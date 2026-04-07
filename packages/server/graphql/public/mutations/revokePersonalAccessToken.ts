import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {selectPersonalAccessToken} from '../../../postgres/select'
import {getUserId} from '../../../utils/authorization'
import type {MutationResolvers} from '../resolverTypes'

export const revokePersonalAccessToken: MutationResolvers['revokePersonalAccessToken'] = async (
  _,
  {tokenId},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const prefix = tokenId.slice('pat_'.length)

  const token = await selectPersonalAccessToken()
    .where('prefix', '=', prefix)
    .where('userId', '=', viewerId)
    .executeTakeFirst()
  if (!token) throw new GraphQLError('Token not found')
  if (token.revokedAt) throw new GraphQLError('Token is already revoked')

  const pg = getKysely()
  await pg
    .updateTable('PersonalAccessToken')
    .set({revokedAt: new Date()})
    .where('id', '=', token.id)
    .execute()

  return {patId: token.id}
}

export default revokePersonalAccessToken
