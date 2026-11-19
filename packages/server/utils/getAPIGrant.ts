import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import ms from 'ms'
import type {DataLoaderWorker} from '../graphql/graphql'
import {PAT_PREFIX} from '../graphql/public/applyScopeDirective'
import {ResourceGrants} from '../graphql/public/ResourceGrants'
import getKysely from '../postgres/getKysely'
import {selectOAuthAPIProvider, selectPersonalAccessToken} from '../postgres/select'
import checkBlacklistJWT from './checkBlacklistJWT'
import getVerifiedAuthToken from './getVerifiedAuthToken'
import hashPersonalAccessToken from './hashPersonalAccessToken'
import {Logger} from './Logger'

export interface APIGrant {
  userId: string
  scopes: string[]
  aud: 'action-pat' | 'action-oauth2'
  resourceGrants: ResourceGrants
  personalAccessTokenId?: string
  clientId?: string
}

const PREFIX_LENGTH = 8
// older tokens were hashed with bcrypt, and are rehashed the first time they're used
// TODO: remove the bcrypt check after 2027-11-18; any token still on bcrypt then just stops working
const isBcryptHash = (storedHash: string) => storedHash.startsWith('$2')
const isTokenMatch = async (rawToken: string, hashedToken: string, storedHash: string) => {
  if (isBcryptHash(storedHash)) return bcrypt.compare(rawToken, storedHash)
  const stored = Buffer.from(storedHash)
  const hashed = Buffer.from(hashedToken)
  return stored.length === hashed.length && crypto.timingSafeEqual(stored, hashed)
}
const getPersonalAccessTokenGrant = async (
  rawToken: string,
  dataLoader: DataLoaderWorker
): Promise<APIGrant> => {
  const prefix = rawToken.slice(0, PREFIX_LENGTH)

  const token = await selectPersonalAccessToken()
    .select('hashedToken')
    .where('prefix', '=', prefix)
    .where('revokedAt', 'is', null)
    .where('expiresAt', '>', sql<Date>`CURRENT_TIMESTAMP`)
    .executeTakeFirst()

  const hashedToken = hashPersonalAccessToken(rawToken)
  if (!token || !(await isTokenMatch(rawToken, hashedToken, token.hashedToken))) {
    throw new GraphQLError('Invalid or revoked personal access token', {
      extensions: {code: 'UNAUTHENTICATED'}
    })
  }

  if (
    isBcryptHash(token.hashedToken) ||
    !token.lastUsedAt ||
    Date.now() - token.lastUsedAt.getTime() > ms('5m')
  ) {
    getKysely()
      .updateTable('PersonalAccessToken')
      .set({lastUsedAt: sql`CURRENT_TIMESTAMP`, hashedToken})
      .where('id', '=', token.id)
      .execute()
      .catch(Logger.error)
  }
  return {
    userId: token.userId,
    scopes: token.scopes,
    aud: 'action-pat',
    personalAccessTokenId: `${PAT_PREFIX}${prefix}`,
    // All granted resources are untrusted! We must verify before executing a query against them
    resourceGrants: new ResourceGrants(
      token.userId,
      token.grantedOrgIds,
      token.grantedTeamIds,
      token.grantedPageIds,
      dataLoader
    )
  }
}

const getOAuthAccessTokenGrant = async (
  jwt: string,
  dataLoader: DataLoaderWorker
): Promise<APIGrant | null> => {
  const accessToken = getVerifiedAuthToken(jwt, false, 'action-oauth2')
  if (!accessToken) return null
  const [isBlacklisted, provider] = await Promise.all([
    checkBlacklistJWT(accessToken),
    accessToken.client_id
      ? selectOAuthAPIProvider().where('clientId', '=', accessToken.client_id).executeTakeFirst()
      : undefined
  ])
  if (isBlacklisted || !provider) {
    throw new GraphQLError('Invalid or revoked OAuth access token', {
      extensions: {code: 'UNAUTHENTICATED'}
    })
  }
  return {
    userId: accessToken.sub,
    scopes: accessToken.scope ?? [],
    aud: 'action-oauth2',
    clientId: accessToken.client_id,
    // The app reaches only the data of the organization that registered it
    resourceGrants: new ResourceGrants(accessToken.sub, [provider.orgId], [], null, dataLoader)
  }
}

const getAPIGrant = async (
  bearerToken: string,
  dataLoader: DataLoaderWorker
): Promise<APIGrant | null> =>
  bearerToken.startsWith(PAT_PREFIX)
    ? getPersonalAccessTokenGrant(bearerToken.slice(PAT_PREFIX.length), dataLoader)
    : getOAuthAccessTokenGrant(bearerToken, dataLoader)

export default getAPIGrant
