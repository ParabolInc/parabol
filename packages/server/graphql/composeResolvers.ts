/*
  GraphQL Guard has a great API, but guard() wraps the whole schema, and we also need rules on interfaces
  and redacted fields, which it doesn't support.
  So, I kept the Guard API for rules, but I call them from our own resolver wrappers

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
import type {GuardRule, PopulatedOptions} from 'graphql-guard'
import {allow, and} from 'graphql-guard'
import {Logger, markErrorAsLogged} from '../utils/Logger'
import type {ResolverFn} from './private/resolverTypes'

export type {GuardRule}

type Resolver = ResolverFn<any, any, any, any>

const options: PopulatedOptions = {
  suppressResolverError: false,
  // debug: true makes graphql-guard re-throw exceptions from rule callbacks
  // instead of silently coercing them to `false` (which surfaces to clients
  // as the opaque "Not authorized"). We catch those throws below and log
  // them with operation context so permission bugs are visible, not hidden.
  debug: true,
  fallbackRule: allow,
  fallbackError: () => new Error('')
}

const redactingRules = new WeakSet<GuardRule>()

// When the rule denies, the field resolves to null (or [] for a non-null list) instead of an error.
// A non-null scalar or object can't be redacted, so it still errors.
export const redactUnless = (rule: GuardRule) => {
  const redactingRule = and(rule)
  redactingRules.add(redactingRule)
  return redactingRule
}

const getRedactedValue = (returnType: GraphQLOutputType) => {
  if (!isNonNullType(returnType)) return null
  if (isListType(returnType.ofType)) return []
  return undefined
}

// graphql-guard caches rule results per (rule, key) for each context object & operation run, so a rule on
// every field of a type runs once per object. Subscription events each get their own cache.
// The cache must also not outlive the viewer & the data it was computed from: a subscription event swaps
// in the dataloader of the mutation that published it, and a login swaps the authToken.
// So rules get a view of the context that is replaced, along with its cache, when either one changes.
type RuleContextView = {authToken: unknown; dataLoader: unknown; ruleContext: object}
const ruleContextViews = new WeakMap<object, RuleContextView>()
const getRuleContext = (context: any) => {
  if (typeof context !== 'object' || context === null) return context
  const {authToken, dataLoader} = context
  const current = ruleContextViews.get(context)
  if (current && current.authToken === authToken && current.dataLoader === dataLoader) {
    return current.ruleContext
  }
  // rules only read the context, so reads fall through to the live context
  const ruleContext = Object.create(context)
  ruleContextViews.set(context, {authToken, dataLoader, ruleContext})
  return ruleContext
}

const wrapResolve = (resolve: Resolver, rule: GuardRule): Resolver => {
  const isRedacting = redactingRules.has(rule)
  return async (source, args, context, info) => {
    let res: unknown
    try {
      res = await rule.resolve(source, args, getRuleContext(context), info, options)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      Logger.error(`Permission rule threw on ${info.parentType.name}.${info.fieldName}`, error)
      const internalError = new GraphQLError('Internal server error', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
      markErrorAsLogged(internalError)
      return internalError
    }
    if (res === true) {
      return resolve(source, args, context, info)
    }
    if (isRedacting) {
      const redactedValue = getRedactedValue(info.returnType)
      if (redactedValue !== undefined) return redactedValue
    }
    if (res === false) return new GraphQLError('Not authorized', {extensions: {code: 'FORBIDDEN'}})
    if (typeof res === 'string') return new GraphQLError(res, {extensions: {code: 'FORBIDDEN'}})
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
    readonly [FieldName: string]: GuardRule
  }
}

const getFieldedType = (typeName: string, schema?: GraphQLSchema) => {
  const type = schema?.getType(typeName)
  return isObjectType(type) || isInterfaceType(type) ? type : undefined
}

const getFieldNames = (
  typeName: string,
  resolverFieldMap: Record<string, unknown>,
  schema?: GraphQLSchema
) => {
  const type = getFieldedType(typeName, schema)
  return Object.keys(type ? type.getFields() : resolverFieldMap)
}

// A type inherits its interfaces' resolvers after this runs (the last interface wins),
// so a rule on a field the type doesn't resolve itself must wrap the interface's resolver
const getUnwrappedResolver = (
  resolverMap: ResolverMap,
  typeName: string,
  fieldName: string,
  schema?: GraphQLSchema
) => {
  const ownResolver = resolverMap[typeName][fieldName]
  if (ownResolver) return ownResolver
  const interfaces = getFieldedType(typeName, schema)?.getInterfaces() ?? []
  const inheritedResolver = interfaces
    .map((interfaceType) => resolverMap[interfaceType.name]?.[fieldName])
    .findLast(Boolean)
  return inheritedResolver ?? defaultFieldResolver
}

// Pass the schema so a '*' rule also covers fields served by the default resolver or inherited from an interface
const composeResolvers = <T extends ResolverMap>(
  resolverMap: T,
  permissionMap: PermissionMap,
  schema?: GraphQLSchema
) => {
  // clone the resolver map to keep this fn pure
  const nextResolverMap = {...resolverMap}
  // Compose interfaces before the types that inherit from them, so an interface's rule still applies under the type's.
  // A type lists every interface its interfaces implement, so it lists more interfaces than any of them
  const countInterfaces = (typeName: string) =>
    getFieldedType(typeName, schema)?.getInterfaces().length ?? 0
  const permissionEntries = Object.entries(permissionMap).sort(
    ([typeNameA], [typeNameB]) => countInterfaces(typeNameA) - countInterfaces(typeNameB)
  )
  permissionEntries.forEach((entry) => {
    const typeName = entry[0] as keyof T
    const ruleFieldMap = entry[1]
    // only clone field maps that will be mutated by permissions
    nextResolverMap[typeName] = {...nextResolverMap[typeName]}
    const nextResolverFieldMap = nextResolverMap[typeName]
    // biome-ignore lint/plugin/noPlainErrorInGraphQL: runs while building the schema, before any request
    if (!nextResolverFieldMap) throw new Error(`No resolver exists for type: ${String(typeName)}`)
    Object.entries(ruleFieldMap).forEach(([fieldName, rule]) => {
      if (fieldName === '*') {
        getFieldNames(String(typeName), nextResolverFieldMap, schema).forEach((schemaFieldName) => {
          // the wildcard is just a default value. if the field has a specific rule, use that
          if (ruleFieldMap[schemaFieldName]) return
          const unwrappedResolver = getUnwrappedResolver(
            nextResolverMap,
            String(typeName),
            schemaFieldName,
            schema
          )
          nextResolverFieldMap[schemaFieldName] = wrapResolve(unwrappedResolver, rule)
        })
      } else {
        // use default if a resolver isn't provided, e.g. a field exists in the DB but only available to superusers via GQL
        const unwrappedResolver = getUnwrappedResolver(
          nextResolverMap,
          String(typeName),
          fieldName,
          schema
        )
        nextResolverFieldMap[fieldName] = wrapResolve(unwrappedResolver, rule)
      }
    })
  })
  return nextResolverMap
}

export default composeResolvers
