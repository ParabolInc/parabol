import AtlassianServerManager from './AtlassianServerManager'

export const hasConfluenceScopes = (scope: string | null | undefined): boolean => {
  if (!scope) return false
  const granted = new Set(scope.split(' '))
  return AtlassianServerManager.CONFLUENCE_SCOPE.every((confluenceScope) =>
    granted.has(confluenceScope)
  )
}
