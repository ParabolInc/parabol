import bcrypt from 'bcryptjs'
import {GraphQLError} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import {sql} from 'kysely'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import type {DataLoaderWorker} from '../graphql/graphql'
import {PAT_PREFIX} from '../graphql/public/applyScopeDirective'
import {ResourceGrants} from '../graphql/public/ResourceGrants'
import getKysely from '../postgres/getKysely'
import {selectOAuthAPIProvider, selectPersonalAccessToken} from '../postgres/select'
import type {ServerContext} from '../yoga'
import checkBlacklistJWT from './checkBlacklistJWT'
import getVerifiedAuthToken from './getVerifiedAuthToken'
import {Logger} from './Logger'
import recordUserActivity from './recordUserActivity'

interface APIGrant {
  userId: string
  scopes: string[]
  aud: 'action-pat' | 'action-oauth2'
  resourceGrants: ResourceGrants
}

const PREFIX_LENGTH = 8
const getPersonalAccessTokenGrant = async (
  rawToken: string,
  dataLoader: DataLoaderWorker
): Promise<APIGrant> => {
  const prefix = rawToken.slice(0, PREFIX_LENGTH)

  const possibleTokens = await selectPersonalAccessToken()
    .select('hashedToken')
    .where('prefix', '=', prefix)
    .where('revokedAt', 'is', null)
    .where('expiresAt', '>', sql<Date>`CURRENT_TIMESTAMP`)
    .execute()

  const matches = await Promise.all(
    possibleTokens.map((t) => bcrypt.compare(rawToken, t.hashedToken))
  )
  const token = possibleTokens[matches.indexOf(true)]

  if (!token) {
    throw new GraphQLError('Invalid or revoked personal access token', {
      extensions: {code: 'UNAUTHORIZED'}
    })
  }

  if (!token.lastUsedAt || Date.now() - token.lastUsedAt.getTime() > ms('5m')) {
    getKysely()
      .updateTable('PersonalAccessToken')
      .set({lastUsedAt: sql`CURRENT_TIMESTAMP`})
      .where('id', '=', token.id)
      .execute()
      .catch(Logger.error)
  }
  return {
    userId: token.userId,
    scopes: token.scopes,
    aud: 'action-pat',
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
      extensions: {code: 'UNAUTHORIZED'}
    })
  }
  return {
    userId: accessToken.sub,
    scopes: accessToken.scope ?? [],
    aud: 'action-oauth2',
    // The app reaches only the data of the organization that registered it
    resourceGrants: new ResourceGrants(accessToken.sub, [provider.orgId], [], null, dataLoader)
  }
}

export const useAPIAccess = (): Plugin<ServerContext & {dataLoader: DataLoaderWorker}> => {
  return {
    async onContextBuilding({context, extendContext}) {
      if (context.authToken) return
      const authHeader: string | null | undefined = context.request?.headers?.get('authorization')
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
      if (!bearerToken) return
      const grant = bearerToken.startsWith(PAT_PREFIX)
        ? await getPersonalAccessTokenGrant(
            bearerToken.slice(PAT_PREFIX.length),
            context.dataLoader
          )
        : await getOAuthAccessTokenGrant(bearerToken, context.dataLoader)
      if (!grant) return
      const {userId, scopes, aud, resourceGrants} = grant

      const [teamMembers, user] = await Promise.all([
        context.dataLoader.get('teamMembersByUserId').load(userId),
        context.dataLoader.get('users').load(userId)
      ])
      if (!user || user.isRemoved) {
        throw new GraphQLError('The user of this access token no longer exists', {
          extensions: {code: 'UNAUTHORIZED'}
        })
      }
      await recordUserActivity(user).catch(Logger.error)
      const tms = teamMembers.map(({teamId}: {teamId: string}) => teamId)
      const authToken = new AuthToken({
        sub: userId,
        tms,
        scope: scopes,
        lifespan_ms: ms('1h'),
        aud
      })
      extendContext({resourceGrants, authToken})
    }
  }
}
