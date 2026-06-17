import type {Resolvers, ResolversParentTypes} from '../resolverTypes'

export const getResolverDotPath = (
  dotPath: `${'source' | 'args'}.${string}`,
  source: Record<string, any>,
  args: Record<string, any>
) => {
  return dotPath.split('.').reduce((val: any, key) => val?.[key], {source, args})
}

type SecondParam<T> = T extends (arg1: any, arg2: infer A, ...args: any[]) => any ? A : never

type ParseParent<T> = T extends `${infer Parent extends string}.${string}` ? Parent : never
type ParseChild<T> = T extends `${string}.${infer Child extends string}` ? Child : never

// The parent ("source") shape for any type is its mapper. graphql-codegen populates
// ResolversParentTypes uniformly for object types (mapper), unions (ResolversUnionTypes),
// and interfaces (ResolversInterfaceTypes), so this works for all of them — unlike keying
// off __isTypeOf, which only exists on object types that are members of an interface/union.
type ExtractParent<T extends keyof ResolversParentTypes> = NonNullable<ResolversParentTypes[T]>

type Source<T> = ParseParent<T> extends keyof ResolversParentTypes
  ? keyof ExtractParent<ParseParent<T>> & string
  : never

type ExtractChild<TOp, TChild extends string> = TChild extends keyof TOp
  ? NonNullable<TOp[TChild]>
  : never

type NestedKeys<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T & (string | number)]: T[K] extends Record<string, unknown>
        ? `${K}` | `${K}.${keyof T[K] & (string | number)}`
        : `${K}`
    }[keyof T & (string | number)]
  : never

type Arg<T> = ParseParent<T> extends keyof Resolvers
  ?
      | (keyof SecondParam<ExtractChild<NonNullable<Resolvers[ParseParent<T>]>, ParseChild<T>>> &
          string)
      | NestedKeys<SecondParam<ExtractChild<NonNullable<Resolvers[ParseParent<T>]>, ParseChild<T>>>>
  : never

export type ResolverDotPath<T> = `source.${Source<T>}` | `args.${Arg<T>}`
