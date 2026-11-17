import AtlassianManager from 'parabol-client/utils/AtlassianManager'

export const hasConfluenceScopes = (scope: string | null | undefined): boolean => {
  if (!scope) return false
  const granted = new Set(scope.split(' '))
  return AtlassianManager.CONFLUENCE_SCOPE.every((confluenceScope) => granted.has(confluenceScope))
}
