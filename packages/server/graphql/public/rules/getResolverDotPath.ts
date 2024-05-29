import {FirstParam} from '../../../../client/types/generics'
import {Resolvers} from '../resolverTypes'

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

type ExtractTypeof<T extends keyof Resolvers> = '__isTypeOf' extends keyof NonNullable<Resolvers[T]>
  ? NonNullable<Resolvers[T]>['__isTypeOf']
  : never
type ExtractParent<T extends keyof Resolvers> = FirstParam<NonNullable<ExtractTypeof<T>>>

type Source<T> =
  ParseParent<T> extends keyof Resolvers
    ? ExtractParent<ParseParent<T>> extends never
      ? never
      : keyof ExtractParent<ParseParent<T>> & string
    : never

type ExtractChild<TOp, TChild extends string> = TChild extends keyof TOp
  ? NonNullable<TOp[TChild]>
  : never

type Arg<T> =
  ParseParent<T> extends keyof Resolvers
    ? keyof SecondParam<ExtractChild<NonNullable<Resolvers[ParseParent<T>]>, ParseChild<T>>> &
        string
    : never

export type ResolverDotPath<T> = `source.${Source<T>}` | `args.${Arg<T>}`
