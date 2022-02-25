export const isNotNull = <T>(item: T | null | undefined): item is T =>
  item !== null && item !== undefined
