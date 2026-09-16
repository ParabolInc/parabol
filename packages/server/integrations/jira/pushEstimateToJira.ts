import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import upsertIntegrationDimensionFieldMap from '../../postgres/queries/upsertIntegrationDimensionFieldMap'
import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import makeScoreJiraComment from '../../utils/makeScoreJiraComment'
import loadDimensionField from '../platform/loadDimensionField'
import type {EstimatePushCtx} from '../platform/ServerIntegrationDefinition'
import resolveJiraDimensionFieldKey from './resolveJiraDimensionFieldKey'

const pushEstimateToJira = async ({
  task,
  taskEstimate,
  dataLoader,
  context,
  info,
  viewerId,
  meetingName,
  discussionURL
}: EstimatePushCtx): Promise<EstimatePushResult | Error> => {
  const {integration, teamId} = task
  if (integration?.service !== 'jira') return new Error('Not a Jira task')
  const {dimensionName, value} = taskEstimate
  const {accessUserId, cloudId, issueKey} = integration
  let jiraFieldId: string | undefined
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

  const dimensionFieldLookup = await loadDimensionField(
    resolveJiraDimensionFieldKey,
    {dataLoader, teamId, userId: accessUserId, context, info, task, viewerId},
    dimensionName
  )
  if (!dimensionFieldLookup) return new Error('Issue not found')
  const {key, field: dimensionField} = dimensionFieldLookup
  const {repoId} = key

  if (dimensionField && dimensionField.issueType !== issueType) {
    const {fieldId, fieldName, fieldType} = dimensionField
    await upsertIntegrationDimensionFieldMap({
      teamId,
      service: 'jira',
      repoId,
      issueType,
      dimensionName,
      fieldId,
      fieldName,
      fieldType
    })
    dataLoader
      .get('integrationDimensionFieldMaps')
      .clear({teamId, service: 'jira', repoId, dimensionName})
  }
  if (!dimensionField) {
    const comment = SprintPokerDefaults.SERVICE_FIELD_COMMENT
    await upsertIntegrationDimensionFieldMap({
      teamId,
      service: 'jira',
      repoId,
      issueType,
      dimensionName,
      fieldId: comment,
      fieldName: null,
      fieldType: 'string'
    })
    dataLoader
      .get('integrationDimensionFieldMaps')
      .clear({teamId, service: 'jira', repoId, dimensionName})
  }

  const fieldId = dimensionField?.fieldId ?? SprintPokerDefaults.SERVICE_FIELD_COMMENT
  if (fieldId === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
    const res = await manager.addComment(
      cloudId,
      issueKey,
      makeScoreJiraComment(dimensionName, value || '<None>', meetingName, discussionURL)
    )
    if ('message' in res) {
      return new Error(res.message)
    }
  } else if (fieldId !== SprintPokerDefaults.SERVICE_FIELD_NULL) {
    const {fieldType} = dimensionField!
    jiraFieldId = fieldId
    try {
      const updatedStoryPoints = fieldType === 'string' ? value : Number(value)

      await manager.updateStoryPoints(cloudId, issueKey, updatedStoryPoints, fieldId)
    } catch (e) {
      return new Error(e instanceof Error ? e.message : 'Unable to updateStoryPoints')
    }
  }
  return jiraFieldId ? {service: 'jira', target: 'field', targetId: jiraFieldId} : null
}

export default pushEstimateToJira
