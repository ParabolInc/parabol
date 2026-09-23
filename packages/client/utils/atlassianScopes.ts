import AtlassianManager from './AtlassianManager'

// offline_access is grant plumbing, not a Jira capability
const JIRA_SCOPES = AtlassianManager.JIRA_SCOPE.filter((s) => s !== 'offline_access')

export const hasJiraScopes = (scope: readonly string[] | null | undefined): boolean =>
  !!scope && JIRA_SCOPES.every((jiraScope) => scope.includes(jiraScope))

export const hasConfluenceScopes = (scope: readonly string[] | null | undefined): boolean =>
  !!scope && AtlassianManager.CONFLUENCE_SCOPE.every((s) => scope.includes(s))

export const describeAtlassianDisconnect = (scope: readonly string[] | null | undefined) => {
  const holdsJira = hasJiraScopes(scope)
  const holdsConfluence = hasConfluenceScopes(scope)
  if (holdsJira && holdsConfluence) return 'Disconnects Jira and Confluence'
  return holdsConfluence ? 'Disconnects Confluence' : 'Disconnects Jira'
}
