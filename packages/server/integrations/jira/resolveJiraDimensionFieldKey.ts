import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import JiraProjectKeyId from 'parabol-client/shared/gqlIds/JiraProjectKeyId'
import type {DimensionFieldCtx, DimensionFieldKey} from '../platform/ServerIntegrationDefinition'

const resolveJiraDimensionFieldKey = async ({
  task,
  dataLoader,
  teamId,
  viewerId
}: DimensionFieldCtx): Promise<DimensionFieldKey | null> => {
  const {integration, id: taskId} = task
  if (integration?.service !== 'jira') return null
  const {cloudId, issueKey, accessUserId} = integration
  const jiraIssue = await dataLoader.get('jiraIssue').load({
    teamId,
    userId: accessUserId,
    cloudId,
    issueKey,
    taskId,
    viewerId
  })
  if (!jiraIssue) return null
  const {issueType, possibleEstimationFields} = jiraIssue
  return {
    repoId: JiraProjectId.join(cloudId, JiraProjectKeyId.join(issueKey)),
    workItemType: issueType,
    usableFieldIds: possibleEstimationFields.map(({fieldId}) => fieldId)
  }
}

export default resolveJiraDimensionFieldKey
