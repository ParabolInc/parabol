import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import MeetingPoker from '../../../database/types/MeetingPoker'
import {AtlassianAuth} from '../../../postgres/queries/getAtlassianAuthByUserIdTeamId'
import upsertJiraDimensionFieldMap from '../../../postgres/queries/upsertJiraDimensionFieldMap'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const getJiraField = async (fieldName: string, cloudId: string, auth: AtlassianAuth) => {
  // we have 2 special treatment fields, SERVICE_FIELD_COMMENT and SERVICE_FIELD_NULL which are handled
  // differently and can't be found on Jira fields list
  const customFields = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ]
  if (customFields.includes(fieldName as any)) {
    return {fieldId: fieldName, type: 'string' as const}
  }
  // a regular Jira field
  const {accessToken} = auth
  const manager = new AtlassianServerManager(accessToken)
  const fields = await manager.getFields(cloudId)
  if (fields instanceof Error || fields instanceof RateLimitError) return null
  const selectedField = fields.find((field) => field.name === fieldName)
  if (!selectedField) return null
  const {id: fieldId, schema} = selectedField
  return {fieldId, type: schema.type as 'string' | 'number'}
}

const updateJiraDimensionField: MutationResolvers['updateJiraDimensionField'] = async (
    _source,
    {
      meetingId,
      cloudId,
      projectKey,
      issueType,
      dimensionName,
      fieldName
    },
  {authToken, dataLoader, socketId: mutatorId}
) => {
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
  const existingDimensionField = await dataLoader.get('jiraDimensionFieldMap').load({teamId, cloudId, projectKey, issueType, dimensionName})
  if (existingDimensionField?.fieldName === fieldName) return data

  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
  if (!auth) {
    return {error: {message: 'Not authenticated with Jira'}}
  }

  const selectedField = await getJiraField(fieldName, cloudId, auth)
  if (!selectedField) return {error: {message: 'Invalid field name'}}
  const {fieldId, type: fieldType} = selectedField

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

  // udpate dataloader object
  if (existingDimensionField) {
    Object.assign(existingDimensionField, newField)
  }
  await upsertJiraDimensionFieldMap(newField)

  publish(SubscriptionChannel.TEAM, teamId, 'UpdateDimensionFieldSuccess', data, subOptions)
  return data
}

export default updateJiraDimensionField
