import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import JiraProjectKeyId from '../../../../client/shared/gqlIds/JiraProjectKeyId'
import MeetingPoker from '../../../database/types/MeetingPoker'
import {JiraIssue} from '../../../dataloader/atlassianLoaders'
import upsertJiraDimensionFieldMap from '../../../postgres/queries/upsertJiraDimensionFieldMap'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

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
  const [task, meeting] = await Promise.all([
    dataLoader.get('tasks').load(taskId),
    dataLoader.get('newMeetings').load(meetingId)
  ])
  if (!meeting) {
    return {error: {message: 'Invalid meetingId'}}
  }
  const {teamId, templateRefId} = meeting as MeetingPoker
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on team'}}
  }
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  const matchingDimension = dimensions.find((dimension) => dimension.name === dimensionName)
  if (!matchingDimension) {
    return {error: {message: 'Invalid dimension name'}}
  }
  if (!task) {
    return {error: {message: 'Task not found'}}
  }
  const {integration} = task
  const service = integration?.service
  if (service !== 'jira') {
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

  const dimensionFields = await dataLoader
    .get('jiraDimensionFieldMap')
    .load({teamId, cloudId, projectKey, issueType, dimensionName})

  const existingDimensionField = dimensionFields[0]
  if (
    existingDimensionField?.fieldId === fieldId &&
    existingDimensionField.issueType === issueType
  ) {
    return data
  }

  const selectedField = await getJiraField(jiraIssue, fieldId)
  if (!selectedField) return {error: {message: 'Invalid field name'}}
  const {fieldName, fieldType} = selectedField

  const newField = {
    teamId,
    cloudId,
    projectKey,
    issueType,
    dimensionName,
    fieldId,
    fieldName,
    fieldType
  }

  await upsertJiraDimensionFieldMap(newField)
  // we might replace the existing item or add a new one, let's just clear to avoid errors
  dataLoader
    .get('jiraDimensionFieldMap')
    .clear({teamId, cloudId, projectKey, issueType, dimensionName})

  publish(SubscriptionChannel.TEAM, teamId, 'UpdateDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateJiraDimensionField
