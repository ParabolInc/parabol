import bcrypt from 'bcryptjs'
import type {GraphQLSchema} from 'graphql'
import {defaultFieldResolver, GraphQLError, getDirectiveValues, isObjectType} from 'graphql'
import {sql} from 'kysely'
import ms from 'ms'
import AuthToken from '../../database/types/AuthToken'
import {selectPersonalAccessToken} from '../../postgres/select'
import {ResourceGrants} from './ResourceGrants'
import type {OAuthScopeEnum as TOAuthScopeEnum} from './resolverTypes'

export const PAT_PREFIX = 'pat_'
const PREFIX_LENGTH = 8

/**
 * Wraps field resolvers that have @scope(name: OAuthScopeEnum!) applied.
 * For PAT bearer tokens, verifies the token exists (non-revoked) and has the required scope.
 * Regular JWT-authenticated requests pass through without scope checks.
 */
export const applyScopeDirective = (schema: GraphQLSchema): GraphQLSchema => {
  const scopeDirective = schema.getDirective('scope')
  if (!scopeDirective) return schema
  for (const type of Object.values(schema.getTypeMap())) {
    if (!isObjectType(type) || type.name.startsWith('__')) continue
    const isScopeDirectiveRequired = type.name === 'Mutation'
    for (const field of Object.values(type.getFields())) {
      if (!field.astNode) continue
      const directiveValues = getDirectiveValues(scopeDirective, field.astNode)
      if (!directiveValues) {
        if (isScopeDirectiveRequired)
          throw new Error(`Missing @scope directive on ${type.name}.${field.name}`)
        continue
      }

      // FIXME: https://github.com/ardatan/graphql-tools/pull/8117
      // const requiredScope = OAuthScopeEnum[directiveValues.name as string] as TOAuthScopeEnum
      const requiredScope = directiveValues.name as TOAuthScopeEnum

      const originalResolver = field.resolve ?? defaultFieldResolver

      field.resolve = async (source, args, context, info) => {
        if (context.authToken?.aud === 'action-pat') {
          // authToken from PAT already created
          if (context.authToken.scope?.includes(requiredScope)) {
            return originalResolver(source, args, context, info)
          }
          throw new GraphQLError(
            `Personal access token is missing required scope: ${requiredScope}`,
            {extensions: {code: 'FORBIDDEN'}}
          )
        }
        const authHeader: string | null | undefined = context.request?.headers?.get('authorization')
        const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

        if (bearerToken?.startsWith(PAT_PREFIX)) {
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

          if (!token.scopes.includes(requiredScope)) {
            throw new GraphQLError(
              `Personal access token is missing required scope: ${requiredScope}`,
              {
                extensions: {code: 'FORBIDDEN'}
              }
            )
          }
          // All granted resources are untrusted! We must verify before executing a query against them
          const resourceGrants = new ResourceGrants(
            token.userId,
            token.grantedOrgIds,
            token.grantedTeamIds,
            token.grantedPageIds,
            context.dataLoader
          )
          context.resourceGrants = resourceGrants

          const teamMembers = await context.dataLoader.get('teamMembersByUserId').load(token.userId)
          const tms = teamMembers.map(({teamId}: {teamId: string}) => teamId)
          context.authToken = new AuthToken({
            sub: token.userId,
            tms,
            scope: token.scopes,
            lifespan_ms: ms('1h'),
            aud: 'action-pat'
          })
        }

        return originalResolver(source, args, context, info)
      }
    }
  }

  return schema
}
