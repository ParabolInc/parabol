import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import JiraProjectKeyId from '../../../../client/shared/gqlIds/JiraProjectKeyId'
import type {JiraIssue} from '../../../dataloader/atlassianLoaders'
import pickDimensionField from '../../../integrations/platform/pickDimensionField'
import upsertIntegrationDimensionFieldMap from '../../../postgres/queries/upsertIntegrationDimensionFieldMap'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import validateDimensionFieldMutation from './helpers/validateDimensionFieldMutation'

const getJiraField = async (jiraIssue: JiraIssue, fieldId: string) => {
  // we have 2 special treatment fields, SERVICE_FIELD_COMMENT and SERVICE_FIELD_NULL which are handled
  // differently and can't be found on Jira fields list
  const customFields = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ]
  if (customFields.includes(fieldId as any)) {
    return {fieldId, fieldName: fieldId, fieldType: 'string' as const}
  }
  // a regular Jira field
  return jiraIssue.possibleEstimationFields.find((field) => field.fieldId === fieldId)
}

const updateJiraDimensionField: MutationResolvers['updateJiraDimensionField'] = async (
  _source,
  {meetingId, taskId, dimensionName, fieldId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const viewerId = getUserId(authToken)
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const meeting = await validateDimensionFieldMutation(dataLoader, meetingId, dimensionName)
  if (meeting instanceof Error) {
    return {error: {message: meeting.message}}
  }
  const {teamId} = meeting
  const task = await dataLoader.get('tasks').load(taskId)
  if (!task) {
    return {error: {message: 'Task not found'}}
  }
  const {integration} = task
  const service = integration?.service
  if (!integration || service !== 'jira') {
    return {error: {message: 'Not a Jira task'}}
  }

  // RESOLUTION
  const data = {teamId, meetingId}
  const {accessUserId, cloudId, issueKey} = integration
  const projectKey = JiraProjectKeyId.join(issueKey)

  const [auth, jiraIssue] = await Promise.all([
    dataLoader.get('freshAtlassianAuth').load({teamId, userId: accessUserId}),
    dataLoader.get('jiraIssue').load({teamId, cloudId, viewerId, userId: accessUserId, issueKey})
  ])

  if (!auth) {
    return {error: {message: 'User no longer has access to Atlassian'}}
  }
  if (!jiraIssue) {
    return {error: {message: 'Issue not found'}}
  }
  const {issueType} = jiraIssue
  const repoId = JiraProjectId.join(cloudId, projectKey)

  const dimensionFields = await dataLoader
    .get('integrationDimensionFieldMaps')
    .load({teamId, service: 'jira', repoId, dimensionName})

  const existingDimensionField = pickDimensionField(dimensionFields, {
    repoId,
    workItemType: issueType
  })
  if (existingDimensionField?.fieldId === fieldId) {
    return data
  }

  const selectedField = await getJiraField(jiraIssue, fieldId)
  if (!selectedField) return {error: {message: 'Invalid field name'}}
  const {fieldName, fieldType} = selectedField

  await upsertIntegrationDimensionFieldMap({
    teamId,
    service: 'jira',
    repoId,
    workItemType: issueType,
    dimensionName,
    fieldId,
    fieldName,
    fieldType
  })
  dataLoader
    .get('integrationDimensionFieldMaps')
    .clear({teamId, service: 'jira', repoId, dimensionName})

  publish(SubscriptionChannel.TEAM, teamId, 'UpdateDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateJiraDimensionField
