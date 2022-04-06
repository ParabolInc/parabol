import stringify from 'fast-json-stable-stringify'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import getRethink from '../../../database/rethinkDriver'
import {AtlassianAuth} from '../../../postgres/queries/getAtlassianAuthByUserIdTeamId'
import updateTeamByTeamId from '../../../postgres/queries/updateTeamByTeamId'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import MeetingPoker from '../../../database/types/MeetingPoker'
import {MutationResolvers} from '../resolverTypes'
import JiraServerRestManager from '../../../integrations/jiraServer/JiraServerRestManager'
import {IntegrationProviderJiraServer} from '../../../postgres/queries/getIntegrationProvidersByIds'
import upsertJiraServerDimensionFieldMap from '../../../postgres/queries/upsertJiraServerDimensionFieldMap'

const getJiraServerField = async (fieldName: string, cloudId: string, auth: AtlassianAuth) => {
  // we have 2 special treatment fields, SERVICE_FIELD_COMMENT and SERVICE_FIELD_NULL which are handled
  // differently and can't be found on JiraServer fields list
  const customFields = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ]
  if (customFields.includes(fieldName as any)) {
    return {fieldId: fieldName, type: 'string' as const}
  }
  // a regular JiraServer field
  const {accessToken} = auth
  const manager = new AtlassianServerManager(accessToken)
  const fields = await manager.getFields(cloudId)
  if (fields instanceof Error || fields instanceof RateLimitError) return null
  const selectedField = fields.find((field) => field.name === fieldName)
  if (!selectedField) return null
  const {id: fieldId, schema} = selectedField
  return {fieldId, type: schema.type as 'string' | 'number'}
}

const updateJiraServerDimensionField: MutationResolvers['updateJiraServerDimensionField'] = async (
    _source,
    {
      dimensionName,
      issueTypeId,
      fieldName,
      projectId,
      meetingId
    },
    {authToken, dataLoader, socketId: mutatorId}
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const viewerId = getUserId(authToken)
    const subOptions = {mutatorId, operationId}

    // VALIDATION
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
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

    // RESOLUTION
    const data = {teamId, meetingId}

    const auth = await dataLoader
      .get('teamMemberIntegrationAuths')
      .load({service: 'jiraServer', teamId, userId: viewerId})
    if (!auth) {
      return {error: {message: 'Not authenticated with JiraServer'}}
    }

    const existingDimensionField = await dataLoader.get('jiraServerDimensionFieldMap').load({providerId: auth.providerId, projectId, teamId, dimensionName})
    if (existingDimensionField?.fieldName === fieldName) return data

    let fieldId: string
    let fieldType: string
    if (fieldName === SprintPokerDefaults.SERVICE_FIELD_NULL || fieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
      fieldId = fieldName
      fieldType = 'string'
    }
    else {
      const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)
      const manager = new JiraServerRestManager(auth, provider as IntegrationProviderJiraServer)
      const fieldTypes = await manager.getFieldTypes(projectId, issueTypeId)
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

    const newField = {
      providerId: auth.providerId,
      teamId,
      projectId,
      dimensionName,
      fieldId,
      fieldName,
      fieldType
    }

    // udpate dataloader object
    Object.assign(existingDimensionField, newField)
    await upsertJiraServerDimensionFieldMap(newField)

    publish(SubscriptionChannel.TEAM, teamId, 'UpdateJiraServerDimensionFieldSuccess', data, subOptions)
    return data
  }

export default updateJiraServerDimensionField
