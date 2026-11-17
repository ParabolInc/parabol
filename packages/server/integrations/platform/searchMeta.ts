const MAX_QUERY_STRING_LENGTH = 2000
const MAX_LIST_LENGTH = 100
const MAX_LIST_VALUE_LENGTH = 256

export const checkQueryString = (queryString: string) =>
  queryString.length > MAX_QUERY_STRING_LENGTH
    ? new Error(`queryString must be at most ${MAX_QUERY_STRING_LENGTH} characters`)
    : undefined

export const rejectUnknownKeys = (rest: Record<string, unknown>) => {
  const unknownKeys = Object.keys(rest)
  return unknownKeys.length > 0
    ? new Error(`Unknown meta keys: ${unknownKeys.join(', ')}`)
    : undefined
}

/** Sorted and deduped, because the IntegrationSearchQuery unique index covers the whole query jsonb */
export const parseMetaList = (key: string, value: unknown): string[] | Error => {
  if (!Array.isArray(value)) return new Error(`meta.${key} must be an array`)
  if (value.length > MAX_LIST_LENGTH) {
    return new Error(`meta.${key} must have at most ${MAX_LIST_LENGTH} values`)
  }
  const isListValue = (item: unknown): item is string =>
    typeof item === 'string' && item.length > 0 && item.length <= MAX_LIST_VALUE_LENGTH
  if (!value.every(isListValue)) {
    return new Error(
      `meta.${key} must be non-empty strings of at most ${MAX_LIST_VALUE_LENGTH} characters`
    )
  }
  return [...new Set(value)].sort()
}
