type ValueType<T> = T extends Record<any, infer U> ? U : never
type NoExtraKeys<O, K extends string | symbol | number> = {
  [P in keyof O]: P extends K ? O[P] : never
}

/**
 * lookup values from an object of structure Record<Enum, ValueType> without loosing the ValuType specificity
 * also check that the record does not contain extra keys not present in Enum
 */
function typedLookup<
  K extends string | number | symbol | keyof T,
  T extends Partial<NoExtraKeys<T, K>>
>(lookup: T, key: K): ValueType<T> | undefined {
  return lookup[key as keyof T] as ValueType<T> | undefined
}

export default typedLookup
