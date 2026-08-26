import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import JiraServerRestManager from '../../../integrations/jiraServer/JiraServerRestManager'
import type {
  EstimatePushCtx,
  EstimatePushResult
} from '../../../integrations/platform/ServerIntegrationDefinition'

const pushEstimateToJiraServer = async ({
  task,
  taskEstimate,
  dataLoader,
  meetingName,
  discussionURL
}: EstimatePushCtx): Promise<EstimatePushResult | Error> => {
  const {integration, teamId} = task
  if (integration?.service !== 'jiraServer') return new Error('Not a Jira Data Center task')
  const {dimensionName, value} = taskEstimate
  const {accessUserId, issueId} = integration

  const auth = await dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'jiraServer', teamId, userId: accessUserId})

  if (!auth) {
    return new Error('User no longer has access to Jira Data Center')
  }

  const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)

  if (provider.service !== 'jiraServer') {
    return new Error('No integration provider found for jiraServer')
  }

  const manager = new JiraServerRestManager(auth, provider)

  const {providerId, repositoryId: projectId} = integration
  const jiraServerIssue = await dataLoader
    .get('jiraServerIssue')
    .load({providerId, teamId, userId: accessUserId, issueId})
  if (!jiraServerIssue) {
    return new Error('Issue not found')
  }
  const {issueType} = jiraServerIssue
  const existingDimensionField = await dataLoader
    .get('jiraServerDimensionFieldMap')
    .load({providerId, projectId, teamId, dimensionName, issueType})

  const fieldId = existingDimensionField?.fieldId ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT

  if (fieldId === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    const res = await manager.addScoreComment(
      dimensionName,
      value || '<None>',
      meetingName,
      discussionURL,
      issueId
    )

    if (res instanceof Error) {
      return new Error(res.message)
    }
  } else if (fieldId !== SprintPokerDefaults.SERVICE_FIELD_NULL) {
    const updatedStoryPoints =
      existingDimensionField?.fieldType === 'number' ? Number(value) : value
    const res = await manager.setField(issueId, fieldId, updatedStoryPoints)
    if (res instanceof Error) {
      return new Error(res.message)
    }
  }
  return {}
}

export default pushEstimateToJiraServer
