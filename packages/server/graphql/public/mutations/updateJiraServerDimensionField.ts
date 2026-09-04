import JiraServerProjectId from 'parabol-client/shared/gqlIds/JiraServerProjectId'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import JiraServerRestManager from '../../../integrations/jiraServer/JiraServerRestManager'
import pickDimensionField from '../../../integrations/platform/pickDimensionField'
import upsertIntegrationDimensionFieldMap from '../../../postgres/queries/upsertIntegrationDimensionFieldMap'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import validateDimensionFieldMutation from './helpers/validateDimensionFieldMutation'

const updateJiraServerDimensionField: MutationResolvers['updateJiraServerDimensionField'] = async (
  _source,
  {dimensionName, issueType, fieldName, projectId, meetingId},
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

  // RESOLUTION
  const data = {teamId, meetingId}

  const auth = await dataLoader
    .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
    .load({service: 'jiraServer', teamId, userId: viewerId})
  if (!auth) {
    return {error: {message: 'Not authenticated with JiraServer'}}
  }

  const repoId = JiraServerProjectId.join(auth.providerId, projectId)
  const dimensionFields = await dataLoader
    .get('integrationDimensionFieldMaps')
    .load({teamId, service: 'jiraServer', repoId, dimensionName})
  const existingDimensionField = pickDimensionField(dimensionFields, {
    repoId,
    issueType
  })
  if (existingDimensionField?.fieldName === fieldName) return data

  let fieldId: string
  let fieldType: string
  if (
    fieldName === SprintPokerDefaults.SERVICE_FIELD_NULL ||
    fieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT
  ) {
    fieldId = fieldName
    fieldType = 'string'
  } else {
    const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
    if (provider.service !== 'jiraServer') {
      return {error: {message: 'Not authenticated with JiraServer'}}
    }
    const manager = new JiraServerRestManager(auth, provider)
    const fieldTypes = await manager.getFieldTypes(projectId, issueType)
    if (fieldTypes instanceof Error) {
      return {error: fieldTypes}
    }
    const jiraFieldType = fieldTypes.find((fieldType) => fieldType.name === fieldName)
    if (!jiraFieldType) {
      return {error: {message: 'Unknown field'}}
    }
    fieldId = jiraFieldType.fieldId
    fieldType = jiraFieldType.schema.type
  }

  await upsertIntegrationDimensionFieldMap({
    teamId,
    service: 'jiraServer',
    repoId,
    issueType,
    dimensionName,
    fieldId,
    fieldName,
    fieldType
  })
  dataLoader
    .get('integrationDimensionFieldMaps')
    .clear({teamId, service: 'jiraServer', repoId, dimensionName})

  publish(SubscriptionChannel.TEAM, teamId, 'UpdateDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateJiraServerDimensionField
