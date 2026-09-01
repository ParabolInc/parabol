import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import JiraProjectKeyId from '../../../client/shared/gqlIds/JiraProjectKeyId'
import getKysely from '../../postgres/getKysely'
import upsertJiraDimensionFieldMap from '../../postgres/queries/upsertJiraDimensionFieldMap'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import makeScoreJiraComment from '../../utils/makeScoreJiraComment'
import type {EstimatePushCtx, EstimatePushResult} from '../platform/ServerIntegrationDefinition'

const pushEstimateToJira = async ({
  task,
  taskEstimate,
  dataLoader,
  viewerId,
  meetingName,
  discussionURL
}: EstimatePushCtx): Promise<EstimatePushResult | Error> => {
  const {integration, teamId} = task
  if (integration?.service !== 'jira') return new Error('Not a Jira task')
  const {dimensionName, value} = taskEstimate
  const {accessUserId, cloudId, issueKey} = integration
  let jiraFieldId: string | undefined
  const projectKey = JiraProjectKeyId.join(issueKey)
  const [auth, jiraIssue] = await Promise.all([
    dataLoader.get('freshAtlassianAuth').load({teamId, userId: accessUserId}),
    dataLoader.get('jiraIssue').load({
      teamId,
      cloudId,
      viewerId,
      userId: accessUserId,
      issueKey
    })
  ])
  if (!auth) {
    return new Error('User no longer has access to Atlassian')
  }
  const {accessToken} = auth
  const manager = new AtlassianServerManager(accessToken)

  if (!jiraIssue) {
    return new Error('Issue not found')
  }
  const {issueType} = jiraIssue

  const dimensionFields = await dataLoader
    .get('jiraDimensionFieldMap')
    .load({teamId, cloudId, projectKey, issueType, dimensionName})

  // Find the best match
  const {possibleEstimationFields} = jiraIssue
  const validFieldIds = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL,
    ...possibleEstimationFields.map(({fieldId}) => fieldId)
  ]
  const dimensionField = dimensionFields.find(({fieldId}) => validFieldIds.includes(fieldId))

  // If we're using a field stored for a different issueType, update the DB to store the new match
  if (dimensionField && dimensionField.issueType !== issueType) {
    // Legacy unknown field type, replace it with an actual issueType
    if (dimensionField.issueType === '') {
      dimensionField.issueType = issueType
      await getKysely()
        .updateTable('JiraDimensionFieldMap')
        .set(dimensionField)
        .where('id', '=', dimensionField.id)
        .execute()
    }
    // Add the type in addition
    else {
      const {fieldId, fieldName, fieldType} = dimensionField
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
    }
    dataLoader
      .get('jiraDimensionFieldMap')
      .clear({teamId, cloudId, projectKey, issueType, dimensionName})
  }
  // Store the default if we don't have a field yet
  if (!dimensionField) {
    const newField = {
      teamId,
      cloudId,
      projectKey,
      issueType,
      dimensionName,
      fieldId: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
      fieldName: SprintPokerDefaults.SERVICE_FIELD_COMMENT,
      fieldType: 'string'
    }
    await upsertJiraDimensionFieldMap(newField)
    dataLoader
      .get('jiraDimensionFieldMap')
      .clear({teamId, cloudId, projectKey, issueType, dimensionName})
  }

  const fieldName = dimensionField?.fieldName ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT
  if (fieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    const res = await manager.addComment(
      cloudId,
      issueKey,
      makeScoreJiraComment(dimensionName, value || '<None>', meetingName, discussionURL)
    )
    if ('message' in res) {
      return new Error(res.message)
    }
  } else if (fieldName !== SprintPokerDefaults.SERVICE_FIELD_NULL) {
    const {fieldId, fieldType} = dimensionField!
    jiraFieldId = fieldId
    try {
      const updatedStoryPoints = fieldType === 'string' ? value : Number(value)

      await manager.updateStoryPoints(cloudId, issueKey, updatedStoryPoints, fieldId)
    } catch (e) {
      return new Error(e instanceof Error ? e.message : 'Unable to updateStoryPoints')
    }
  }
  return jiraFieldId ? {column: 'jiraFieldId', value: jiraFieldId} : null
}

export default pushEstimateToJira
