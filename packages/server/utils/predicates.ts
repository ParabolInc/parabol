export const isNotNull = <T>(item: T | null | undefined): item is T =>
  item !== null && item !== undefined

export const isNeitherNullNorError = <T>(item: T | Error | null | undefined): item is T =>
  isNotNull(item) && !(item instanceof Error)
