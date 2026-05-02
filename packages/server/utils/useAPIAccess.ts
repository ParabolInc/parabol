import bcrypt from 'bcryptjs'
import {GraphQLError} from 'graphql'
import type {Plugin} from 'graphql-yoga'
import {sql} from 'kysely'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import type {DataLoaderWorker} from '../graphql/graphql'
import {PAT_PREFIX} from '../graphql/public/applyScopeDirective'
import {ResourceGrants} from '../graphql/public/ResourceGrants'
import {selectPersonalAccessToken} from '../postgres/select'
import type {ServerContext} from '../yoga'

const PREFIX_LENGTH = 8
export const useAPIAccess = (): Plugin<ServerContext & {dataLoader: DataLoaderWorker}> => {
  return {
    async onContextBuilding({context, extendContext}) {
      if (context.authToken) return
      const authHeader: string | null | undefined = context.request?.headers?.get('authorization')
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
      if (!bearerToken || !bearerToken.startsWith(PAT_PREFIX)) return

      const rawToken = bearerToken.slice(PAT_PREFIX.length)
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

      // All granted resources are untrusted! We must verify before executing a query against them
      const resourceGrants = new ResourceGrants(
        token.userId,
        token.grantedOrgIds,
        token.grantedTeamIds,
        token.grantedPageIds,
        context.dataLoader
      )

      const teamMembers = await context.dataLoader.get('teamMembersByUserId').load(token.userId)
      const tms = teamMembers.map(({teamId}: {teamId: string}) => teamId)
      const authToken = new AuthToken({
        sub: token.userId,
        tms,
        scope: token.scopes,
        lifespan_ms: ms('1h'),
        aud: 'action-pat'
      })
      extendContext({resourceGrants, authToken})
    }
  }
}
