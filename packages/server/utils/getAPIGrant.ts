import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import ms from 'ms'
import type {DataLoaderWorker} from '../graphql/graphql'
import {PAT_PREFIX} from '../graphql/public/applyScopeDirective'
import {ResourceGrants} from '../graphql/public/ResourceGrants'
import getKysely from '../postgres/getKysely'
import {selectPersonalAccessToken} from '../postgres/select'
import {CipherId} from './CipherId'
import checkBlacklistJWT from './checkBlacklistJWT'
import getVerifiedAuthToken from './getVerifiedAuthToken'
import hashRandomToken from './hashRandomToken'
import {Logger} from './Logger'

export interface APIGrant {
  userId: string
  scopes: string[]
  aud: 'action-pat' | 'action-oauth2'
  resourceGrants: ResourceGrants
  personalAccessTokenId?: string
  clientId?: string
  grantId?: number
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

  const hashedToken = hashRandomToken(rawToken)
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

const throwInvalidOAuthToken = (): never => {
  throw new GraphQLError('Invalid or revoked OAuth access token', {
    extensions: {code: 'UNAUTHENTICATED'}
  })
}

const getOAuthAccessTokenGrant = async (
  jwt: string,
  dataLoader: DataLoaderWorker,
  expectedResource: string | undefined
): Promise<APIGrant | null> => {
  const accessToken = getVerifiedAuthToken(jwt, false, 'action-oauth2', true)
  if (!accessToken) return null
  if (accessToken.exp * 1000 + ms('10s') < Date.now()) {
    throw new GraphQLError('OAuth access token expired', {extensions: {code: 'UNAUTHENTICATED'}})
  }
  if (accessToken.resource && accessToken.resource !== expectedResource) {
    throw new GraphQLError(`This access token is for ${accessToken.resource}`, {
      extensions: {code: 'UNAUTHENTICATED'}
    })
  }
  const {client_id: clientId, grant_id: grantCode, sub: userId} = accessToken
  if (!clientId || grantCode === undefined) return throwInvalidOAuthToken()
  const grantId = CipherId.decrypt(grantCode)
  const [isBlacklisted, grant] = await Promise.all([
    checkBlacklistJWT(accessToken),
    dataLoader.get('oauthAPIGrants').load(grantId)
  ])
  if (isBlacklisted || !grant || grant.clientId !== clientId || grant.userId !== userId) {
    return throwInvalidOAuthToken()
  }
  if (!grant.lastUsedAt || Date.now() - grant.lastUsedAt.getTime() > ms('5m')) {
    getKysely()
      .updateTable('OAuthAPIGrant')
      .set({lastUsedAt: sql`CURRENT_TIMESTAMP`})
      .where('id', '=', grant.id)
      .execute()
      .catch(Logger.error)
  }
  return {
    userId,
    scopes: (accessToken.scope ?? []).filter((scope) => grant.scopes.includes(scope)),
    aud: 'action-oauth2',
    clientId,
    grantId: grant.id,
    resourceGrants: new ResourceGrants(
      userId,
      grant.grantedOrgIds,
      grant.grantedTeamIds,
      grant.grantedPageIds,
      dataLoader
    )
  }
}

const getAPIGrant = async (
  bearerToken: string,
  dataLoader: DataLoaderWorker,
  expectedResource?: string
): Promise<APIGrant | null> =>
  bearerToken.startsWith(PAT_PREFIX)
    ? getPersonalAccessTokenGrant(bearerToken.slice(PAT_PREFIX.length), dataLoader)
    : getOAuthAccessTokenGrant(bearerToken, dataLoader, expectedResource)

export default getAPIGrant
