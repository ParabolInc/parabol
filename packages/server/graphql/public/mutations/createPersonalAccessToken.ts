import crypto from 'node:crypto'
import {GraphQLError} from 'graphql'
import ms from 'ms'
import getKysely from '../../../postgres/getKysely'
import hashRandomToken from '../../../utils/hashRandomToken'
import type {MutationResolvers} from '../resolverTypes'
import assertResourceGrantLimits from './helpers/assertResourceGrantLimits'

let enabled = true
export const createPersonalAccessToken: MutationResolvers['createPersonalAccessToken'] = async (
  _,
  args,
  {authToken}
) => {
  const {name, scopes, grantedOrgIds, grantedTeamIds, grantedPageIds, expiresAt} = args
  const {sub: userId} = authToken
  if (scopes.length === 0) {
    throw new GraphQLError('Must pick at least one scope', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const maxExpiry = new Date(Date.now() + ms('1y'))
  if (expiresAt > maxExpiry) {
    throw new GraphQLError('Expiration date cannot be more than 1 year in the future', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  if (name.length > 255) {
    throw new GraphQLError('Name cannot be more than 255 characters', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  assertResourceGrantLimits({grantedOrgIds, grantedTeamIds, grantedPageIds})
  if (!enabled) {
    throw new GraphQLError(
      'PATs not enabled for your account. Reach out to sales to enable for free',
      {extensions: {code: 'FORBIDDEN'}}
    )
  }
  const rawToken = crypto.randomBytes(32).toString('base64url')
  const prefix = rawToken.slice(0, 8)
  const hashedToken = hashRandomToken(rawToken)

  const pg = getKysely()
  const pat = await pg
    .insertInto('PersonalAccessToken')
    .values({
      userId,
      name,
      prefix,
      hashedToken,
      scopes,
      grantedOrgIds: grantedOrgIds,
      grantedTeamIds: grantedTeamIds,
      grantedPageIds: grantedPageIds,
      expiresAt: expiresAt
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  return {token: rawToken, patId: pat.id}
}

export default createPersonalAccessToken
