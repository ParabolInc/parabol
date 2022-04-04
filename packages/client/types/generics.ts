import {MutableRefObject} from 'react'
import {RecordProxy} from 'relay-runtime'

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
export type Subtract<T, K> = Omit<T, keyof K>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : DeepPartial<T[P]>
}
export type DeepNullable<T> = {
  [P in keyof T]: T[P] extends (infer U)[]
    ? DeepNullable<U>[] | null
    : T[P] extends readonly (infer U)[]
    ? readonly DeepNullable<U>[] | null
    : DeepNullable<T[P]> | null
}

export type DeepNonNullable<T> = T extends (...args: any[]) => any
  ? T
  : T extends any[]
  ? DeepNonNullableArray<T[number]>
  : T extends object
  ? DeepNonNullableObject<T>
  : T

interface DeepNonNullableArray<T> extends Array<DeepNonNullable<NonNullable<T>>> {}

type DeepNonNullableObject<T> = {
  [P in keyof T]-?: DeepNonNullable<NonNullable<T[P]>>
}

// export type DeepNullableObject<T> = {
//   [P in keyof T]: T[P] extends Array<infer U>
//     ? Array<DeepNullable<U>> | null
//     : T[P] extends ReadonlyArray<infer U>
//       ? ReadonlyArray<DeepNullable<U>> | null
//       : T[P] extends object
//         ? DeepNullable<T[P]> | null
//         : T[P]
// };
export type Opaque<K, T> = T & {__TYPE__: K}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}
export type Writeable<T> = {-readonly [P in keyof T]: T[P]}
export type DeepWriteable<T> = {-readonly [P in keyof T]: DeepWriteable<T[P]>}
// there's rumor of a negated operator coming to TS soon...
export type NotVoid =
  | {[key: string]: NotVoid}
  | object
  | string
  | boolean
  | symbol
  | number
  | null
  | undefined

export type ValueOf<T> = T[keyof T]

export type FirstParam<T> = T extends (arg1: infer A, ...args: any[]) => any ? A : never
export type SecondPlusParams<T> = T extends (node: any, ...args: infer A) => void ? A : never
export type UnshiftToTuple<V, T extends any[]> = Parameters<(a: V, ...args: T) => void>
export type Unpromise<T> = T extends Promise<infer U> ? U : T
export type Unref<T> = T extends MutableRefObject<infer U> ? U : T
export type RefCallbackInstance<T extends HTMLElement = HTMLElement> = T | null
export type Unarray<T> = T extends ArrayLike<infer U> ? U : T

type PrependNextNum<A extends Array<unknown>> = A['length'] extends infer T
  ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
    ? X
    : never
  : never

type EnumerateInternal<A extends Array<unknown>, N extends number> = {
  0: A
  1: EnumerateInternal<PrependNextNum<A>, N>
}[N extends A['length'] ? 0 : 1]

export type Enumerate<N extends number> = EnumerateInternal<[], N> extends (infer E)[] ? E : never

export type Range<FROM extends number, TO extends number> = Exclude<Enumerate<TO>, Enumerate<FROM>>

export type GQLType<T, U> = Extract<T, {__typename: U}>
export type MaybeReadonly<T> = T | Readonly<T>
export type Unproxy<T> = T extends RecordProxy<infer U> ? U : T

// Can remove when this gets merged: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/55847
export type DiscriminateProxy<T, U> = RecordProxy<Extract<Unproxy<T>, {__typename: U}>>
export type NonEmptyArray<T> = [T, ...T[]]
