import AtlassianManager from 'parabol-client/utils/AtlassianManager'

// offline_access is grant plumbing, not a Jira capability
const JIRA_SCOPES = AtlassianManager.JIRA_SCOPE.filter((s) => s !== 'offline_access')

export const hasJiraScopes = (scope: string | null | undefined): boolean => {
  if (!scope) return false
  const granted = new Set(scope.split(' '))
  return JIRA_SCOPES.every((jiraScope) => granted.has(jiraScope))
}
