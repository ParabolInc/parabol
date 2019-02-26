export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
export type Subtract<T, K> = Omit<T, keyof K>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>
}
export type DeepNullable<T> = {
  [P in keyof T]: T[P] extends Array<infer U>
    ? Array<DeepNullable<U>> | null
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepNullable<U>> | null
    : DeepNullable<T[P]> | null
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
