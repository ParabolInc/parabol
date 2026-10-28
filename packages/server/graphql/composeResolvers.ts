/*
  GraphQL Shield has a great API but it uses graphql-middleware, which is horrendously slow.
  This is because the middleware wraps every single field. yikes!
  It also does typechecks in runtime that we can do at build time

  resolver-composition uses a barebones middleware, but the API is lacking (e.g. no caching, uses dot-separated strings for fields)
  So, I kept the Shield API for rules, but I don't run it through graphql-middleware
  Unfortunately, it still requires graphql-middleware, which is why it's a dependency

  This file accepts resolvers and permissions and applies permissions as higher order functions to those resolvers
*/
import {
  defaultFieldResolver,
  GraphQLError,
  type GraphQLOutputType,
  type GraphQLSchema,
  isInterfaceType,
  isListType,
  isNonNullType,
  isObjectType
} from 'graphql'
import type {IRules} from 'graphql-shield'
import {allow, and} from 'graphql-shield'
import hash from 'object-hash'
import {Logger} from '../utils/Logger'
import type {ResolverFn} from './private/resolverTypes'

// hack to get ShieldRule since it's not exported from graphql-shield
export type ShieldRule = Extract<IRules, {resolve: any}>

type Resolver = ResolverFn<any, any, any, any>

const options = {
  allowExternalErrors: false,
  // debug: true makes graphql-shield re-throw exceptions from rule callbacks
  // instead of silently coercing them to `false` (which surfaces to clients
  // as the opaque "Not authorized"). We catch those throws below and log
  // them with operation context so permission bugs are visible, not hidden.
  debug: true,
  fallbackRule: allow,
  fallbackError: () => new Error(''),
  hashFunction: hash
}

const redactingRules = new WeakSet<ShieldRule>()

// When the rule denies, the field resolves to null (or [] for a non-null list) instead of an error.
// A non-null scalar or object can't be redacted, so it still errors.
export const redactUnless = (rule: ShieldRule) => {
  const redactingRule = and(rule)
  redactingRules.add(redactingRule)
  return redactingRule
}

const getRedactedValue = (returnType: GraphQLOutputType) => {
  if (!isNonNullType(returnType)) return null
  if (isListType(returnType.ofType)) return []
  return undefined
}

// Rule results are cached per (rule, key) so a rule on every field of a type runs once per object.
// The cache lives as long as the viewer & the data it was computed from: a subscription event swaps
// in the dataloader of the mutation that published it, and a login swaps the authToken.
const ensurePermissionCache = (context: any) => {
  const {authToken, dataLoader} = context
  const current = context._shield
  if (current?.authToken === authToken && current?.dataLoader === dataLoader) return
  context._shield = {cache: {}, authToken, dataLoader}
}

const wrapResolve = (resolve: Resolver, rule: ShieldRule): Resolver => {
  const isRedacting = redactingRules.has(rule)
  return async (source, args, context, info) => {
    ensurePermissionCache(context)
    let res: unknown
    try {
      res = await rule.resolve(source, args, context, info, options)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      Logger.error(`Permission rule threw on ${info.parentType.name}.${info.fieldName}`, error)
      return new GraphQLError('Internal server error', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    }
    if (res === true) {
      try {
        return await resolve(source, args, context, info)
      } catch (err) {
        if (!(err instanceof GraphQLError)) {
          Logger.log(err)
        }
        throw err
      }
    }
    if (isRedacting) {
      const redactedValue = getRedactedValue(info.returnType)
      if (redactedValue !== undefined) return redactedValue
    }
    if (res === false) return new GraphQLError('Not authorized')
    if (typeof res === 'string') return new GraphQLError(res)
    return res
  }
}

type ResolverMap = {
  // This type causes too much recursion, so I set it to any
  // {[FieldName: string]: R<any, any, any, any>} | GraphQLScalarType | SubscriptionResolvers
  readonly [TypeName: string]: any
}

interface PermissionMap {
  readonly [TypeName: string]: {
    readonly [FieldName: string]: ShieldRule
  }
}

const getFieldNames = (
  typeName: string,
  resolverFieldMap: Record<string, unknown>,
  schema?: GraphQLSchema
) => {
  const type = schema?.getType(typeName)
  if (isObjectType(type) || isInterfaceType(type)) return Object.keys(type.getFields())
  return Object.keys(resolverFieldMap)
}

// Pass the schema so a '*' rule also covers fields served by the default resolver
const composeResolvers = <T extends ResolverMap>(
  resolverMap: T,
  permissionMap: PermissionMap,
  schema?: GraphQLSchema
) => {
  // clone the resolver map to keep this fn pure
  const nextResolverMap = {...resolverMap}
  Object.entries(permissionMap).forEach((entry) => {
    const typeName = entry[0] as keyof T
    const ruleFieldMap = entry[1]
    // only clone field maps that will be mutated by permissions
    nextResolverMap[typeName] = {...nextResolverMap[typeName]}
    const nextResolverFieldMap = nextResolverMap[typeName]
    if (!nextResolverFieldMap) throw new Error(`No resolver exists for type: ${String(typeName)}`)
    Object.entries(ruleFieldMap).forEach(([fieldName, rule]) => {
      if (fieldName === '*') {
        getFieldNames(String(typeName), nextResolverFieldMap, schema).forEach((schemaFieldName) => {
          // the wildcard is just a default value. if the field has a specific rule, use that
          if (ruleFieldMap[schemaFieldName]) return
          const unwrappedResolver = nextResolverFieldMap[schemaFieldName] || defaultFieldResolver
          nextResolverFieldMap[schemaFieldName] = wrapResolve(unwrappedResolver, rule)
        })
      } else {
        // use default if a resolver isn't provided, e.g. a field exists in the DB but only available to superusers via GQL
        const unwrappedResolver = nextResolverFieldMap[fieldName] || defaultFieldResolver
        nextResolverFieldMap[fieldName] = wrapResolve(unwrappedResolver, rule)
      }
    })
  })
  return nextResolverMap
}

export default composeResolvers
