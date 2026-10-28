const MAX_TOKENS = 8
const MIN_TOKEN_LENGTH = 2
const TURKISH_DOTTED_I = /i\u0307/g

export const toPrefixTsQuery = (query: string) => {
  const lowercased = query.toLowerCase().replace(TURKISH_DOTTED_I, 'i')
  const tokens = [...new Set(lowercased.match(/[\p{L}\p{M}\p{N}]+/gu) ?? [])]
    .filter((token) => [...token].length >= MIN_TOKEN_LENGTH)
    .slice(0, MAX_TOKENS)
  if (tokens.length === 0) return null
  return tokens.map((token) => `${token}:*`).join(' & ')
}
