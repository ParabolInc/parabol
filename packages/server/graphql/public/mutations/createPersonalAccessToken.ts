import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import {GraphQLError} from 'graphql'
import ms from 'ms'
import {Security} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import type {MutationResolvers} from '../resolverTypes'

export const createPersonalAccessToken: MutationResolvers['createPersonalAccessToken'] = async (
  _,
  args,
  {authToken}
) => {
  const {label, scopes, grantedOrgIds, grantedTeamIds, grantedPageIds, expiresAt} = args
  const {sub: userId} = authToken

  if (scopes.length === 0) {
    throw new GraphQLError('Must pick at least one scope')
  }

  const maxExpiry = new Date(Date.now() + ms('1y'))
  if (expiresAt > maxExpiry) {
    throw new GraphQLError('Expiration date cannot be more than 1 year in the future')
  }

  const rawToken = crypto.randomBytes(32).toString('base64url')
  const prefix = rawToken.slice(0, 8)
  const hashedToken = await bcrypt.hash(rawToken, Security.SALT_ROUNDS)

  const pg = getKysely()
  const pat = await pg
    .insertInto('PersonalAccessToken')
    .values({
      userId,
      label,
      prefix,
      hashedToken,
      scopes,
      grantedOrgIds: grantedOrgIds,
      grantedTeamIds: grantedTeamIds,
      grantedPageIds: grantedPageIds,
      expiresAt: expiresAt
    })
    .returningAll()
    .executeTakeFirstOrThrow()

  return {token: rawToken, pat}
}

export default createPersonalAccessToken
