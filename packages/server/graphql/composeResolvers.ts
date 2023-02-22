/*
  GraphQL Shield has a great API but it uses graphql-middleware, which is horrendously slow.
  This is because the middleware wraps every single field. yikes!
  It also does typechecks in runtime that we can do at build time

  resolver-composition uses a barebones middleware, but the API is lacking (e.g. no caching, uses dot-separated strings for fields)
  So, I kept the Shield API for rules, but I don't run it through graphql-middleware
  Unfortunately, it still requires graphql-middleware, which is why it's a dependency

  This file accepts resolvers and permissions and applies permissions as higher order functions to those resolvers
*/
import {allow} from 'graphql-shield'
import type {ShieldRule} from 'graphql-shield/dist/types'
import hash from 'object-hash'
import {ResolverFn} from './private/resolverTypes'

type Resolver = ResolverFn<any, any, any, any>

const options = {
  allowExternalErrors: false,
  debug: false,
  fallbackRule: allow,
  fallbackError: () => new Error(''),
  hashFunction: hash
}

const wrapResolve =
  (resolve: Resolver, rule: ShieldRule): Resolver =>
  async (source, args, context, info) => {
    if (!context._shield) {
      context._shield = {
        cache: {}
      }
    }
    try {
      const res = await rule.resolve(source, args, context, info, options)
      if (res === true) {
        return await resolve(source, args, context, info)
      } else {
        if (res === false) return new Error('Not authorized')
        if (typeof res === 'string') return new Error(res)
        return res
      }
    } catch (err) {
      throw err
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

const composeResolvers = <T extends ResolverMap>(resolverMap: T, permissionMap: PermissionMap) => {
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
        // apply this rule to every member of the nextResolverFieldMap
        // Note: Permissions don't get applied to fields that don't have custom resolvers!
        // If this becomes a problem, we'll need to use the schema to get the typeMaps
        Object.entries(nextResolverFieldMap).forEach(([resolverFieldName, resolve]) => {
          // the wildcard is just a default value. if the field has a specific rule, use that
          if (ruleFieldMap[resolverFieldName]) return
          nextResolverFieldMap[resolverFieldName] = wrapResolve(resolve as Resolver, rule)
        })
      } else {
        const unwrappedResolver = nextResolverFieldMap[fieldName]
        if (!unwrappedResolver) {
          throw new Error(`No resolver exists for field: ${fieldName}`)
        }
        nextResolverFieldMap[fieldName] = wrapResolve(unwrappedResolver, rule)
      }
    })
  })
  return nextResolverMap
}

export default composeResolvers
