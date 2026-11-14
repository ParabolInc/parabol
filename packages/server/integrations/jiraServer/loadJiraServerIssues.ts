import type {AnyTaskIntegration} from 'parabol-client/shared/types/TaskIntegration'
import logError from '../../utils/logError'
import type {RepoFetchCtx} from '../platform/ServerIntegrationDefinition'
import JiraServerRestManager from './JiraServerRestManager'

export interface JiraServerIssue {
  id: string
  providerId: number
  self: string
  issueKey: string
  descriptionHTML: string
  summary: string
  description: string | null
  projectId: string
  projectKey: string
  issueType: string
  service: 'jiraServer'
}

/** Null when the issue is gone or the connection is dead */
const loadJiraServerIssues = async (
  {dataLoader, teamId, userId}: RepoFetchCtx,
  integrations: readonly AnyTaskIntegration[]
): Promise<(JiraServerIssue | null)[]> => {
  const auth = await dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'jiraServer', teamId, userId})
  if (!auth) return integrations.map(() => null)
  const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
  if (provider.service !== 'jiraServer') return integrations.map(() => null)
  const manager = new JiraServerRestManager(auth, provider)
  return Promise.all(
    integrations.map(async (integration): Promise<JiraServerIssue | null> => {
      if (integration.service !== 'jiraServer') return null
      const {issueId} = integration
      const issue = await manager.getIssue(issueId)
      if (issue instanceof Error) {
        logError(issue, {userId, tags: {issueId, teamId}})
        return null
      }
      const {project, issuetype, summary, description} = issue.fields
      return {
        ...issue,
        providerId: provider.id,
        issueKey: issue.key,
        descriptionHTML: issue.renderedFields.description,
        projectId: project.id,
        projectKey: project.key,
        issueType: issuetype.id,
        summary,
        description,
        service: 'jiraServer'
      }
    })
  )
}

export default loadJiraServerIssues
