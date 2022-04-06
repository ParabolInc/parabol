import stringify from 'fast-json-stable-stringify'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import getRethink from '../../database/rethinkDriver'
import {AtlassianAuth} from '../../postgres/queries/getAtlassianAuthByUserIdTeamId'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {JiraDimensionField} from '../../postgres/queries/getTeamsByIds'
import MeetingPoker from '../../database/types/MeetingPoker'
import {MutationResolvers} from '../public/resolverTypes'

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

const updateDimensionField: MutationResolvers['updateDimensionField'] = async (
    _source,
    {
      dimensionName,
      fieldName,
      meetingId,
      cloudId,
      projectKey
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
    const team = await dataLoader.get('teams').load(teamId)
    const jiraDimensionFields = team?.jiraDimensionFields || []
    const existingDimensionField = jiraDimensionFields.find(
      (dimensionField) =>
        dimensionField.dimensionName === dimensionName &&
        dimensionField.cloudId === cloudId &&
        dimensionField.projectKey === projectKey
    )
    if (existingDimensionField?.fieldName === fieldName) return data

    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
    if (!auth) {
      return {error: {message: 'Not authenticated with Jira'}}
    }

    const selectedField = await getJiraField(fieldName, cloudId, auth)
    if (!selectedField) return {error: {message: 'Invalid field name'}}
    const {fieldId, type} = selectedField

    const newField = {
      dimensionName,
      fieldName,
      fieldId,
      cloudId,
      fieldType: type,
      projectKey
    } as JiraDimensionField
    if (existingDimensionField) {
      // mutate the existing record
      Object.assign(existingDimensionField, newField)
    } else {
      jiraDimensionFields.push(newField)
    }

    const MAX_JIRA_DIMENSION_FIELDS = 100 // prevent a-holes from unbounded growth of the Team object
    const sortedJiraDimensionFields = jiraDimensionFields
      .slice(jiraDimensionFields.length - MAX_JIRA_DIMENSION_FIELDS)
      .sort((a, b) => (stringify(a) < stringify(b) ? -1 : 1))
    const updates = {
      jiraDimensionFields: sortedJiraDimensionFields,
      updatedAt: new Date()
    }
    await Promise.all([
      r.table('Team').get(teamId).update(updates).run(),
      updateTeamByTeamId(updates, teamId)
    ])

    publish(SubscriptionChannel.TEAM, teamId, 'UpdateJiraDimensionFieldSuccess', data, subOptions)
    return data
  }

export default updateDimensionField
