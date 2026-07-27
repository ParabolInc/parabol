import AtlassianServerManager from '../../../../utils/AtlassianServerManager'

const KNOWN_SCOPES = new Set<string>([
  ...AtlassianServerManager.SCOPE,
  ...AtlassianServerManager.CONFLUENCE_SCOPE,
  'manage:jira-project'
])

export const validateAtlassianScopes = (
  scopes: readonly string[] | null | undefined
): string | null => {
  if (!scopes || scopes.length === 0) return null
  if (!scopes.every((scope) => KNOWN_SCOPES.has(scope))) return null
  return scopes.join(' ')
}
