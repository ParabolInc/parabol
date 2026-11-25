import type {GraphQLSchema} from 'graphql'
import {
  defaultFieldResolver,
  GraphQLError,
  getDirectiveValues,
  getNamedType,
  isObjectType
} from 'graphql'
import type AuthToken from '../../database/types/AuthToken'
import getAssetOwnerScope from '../../utils/getAssetOwnerScope'
import type {AssetScopeEnum, OAuthScopeEnum as TOAuthScopeEnum} from './resolverTypes'

export const PAT_PREFIX = 'pat_'

export const getMissingScopeError = (
  authToken: AuthToken | null | undefined,
  requiredScope: TOAuthScopeEnum
) =>
  authToken && authToken.aud !== 'action' && !authToken.scope?.includes(requiredScope)
    ? new GraphQLError(`Access token is missing required scope: ${requiredScope}`, {
        extensions: {code: 'FORBIDDEN'}
      })
    : null

/**
 * Wraps field resolvers that have @scope applied, with either a static name or an ownerFromArg.
 * For access tokens (PATs and OAuth access tokens), verifies the token has the required scope.
 * Session requests pass through without scope checks.
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
        if (isScopeDirectiveRequired) {
          // biome-ignore lint/plugin/noPlainErrorInGraphQL: runs while building the schema, before any request
          throw new Error(`Missing @scope directive on ${type.name}.${field.name}`)
        }
        continue
      }

      const {name, ownerFromArg} = directiveValues as {name?: string; ownerFromArg?: string}
      if (!name === !ownerFromArg) {
        // biome-ignore lint/plugin/noPlainErrorInGraphQL: runs while building the schema, before any request
        throw new Error(
          `@scope on ${type.name}.${field.name} needs exactly one of name or ownerFromArg`
        )
      }

      if (ownerFromArg) {
        const ownerArg = field.args.find((arg) => arg.name === ownerFromArg)
        if (!ownerArg || getNamedType(ownerArg.type).name !== 'AssetScopeEnum') {
          // biome-ignore lint/plugin/noPlainErrorInGraphQL: runs while building the schema, before any request
          throw new Error(
            `@scope ownerFromArg on ${type.name}.${field.name} must name an AssetScopeEnum argument`
          )
        }
      }

      // FIXME: https://github.com/ardatan/graphql-tools/pull/8117
      // const requiredScope = OAuthScopeEnum[directiveValues.name as string] as TOAuthScopeEnum
      const getRequiredScope = (args: Record<string, unknown>) =>
        ownerFromArg
          ? getAssetOwnerScope(args[ownerFromArg] as AssetScopeEnum, 'write')
          : (name as TOAuthScopeEnum)

      const originalResolver = field.resolve ?? defaultFieldResolver

      field.resolve = async (source, args, context, info) => {
        const missingScopeError = getMissingScopeError(context.authToken, getRequiredScope(args))
        if (missingScopeError) throw missingScopeError
        return originalResolver(source, args, context, info)
      }
    }
  }

  return schema
}
