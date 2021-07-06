import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import JiraDimensionField from '../../database/types/JiraDimensionField'
import {FreshAtlassianAuth} from '../../dataloader/customLoaderMakers'
import getTemplateRefById from '../../postgres/queries/getTemplateRefById'
import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateJiraDimensionFieldPayload from '../types/UpdateJiraDimensionFieldPayload'
import stringify from 'fast-json-stable-stringify'

const getJiraField = async (fieldName: string, cloudId: string, auth: FreshAtlassianAuth) => {
  // we have 2 special treatment fields, JIRA_FIELD_COMMENT and JIRA_FIELD_NULL which are handled
  // differently and can't be found on Jira fields list
  const customFields = [SprintPokerDefaults.JIRA_FIELD_COMMENT, SprintPokerDefaults.JIRA_FIELD_NULL]
  if (customFields.includes(fieldName as any)) {
    return {fieldId: fieldName, type: 'string' as const}
  }
  // a regular Jira field
  const {accessToken} = auth
  const manager = new AtlassianServerManager(accessToken)
  const fields = await manager.getFields(cloudId)
  const selectedField = fields.find((field) => field.name === fieldName)
  if (!selectedField) return null
  const {id: fieldId, schema} = selectedField
  return {fieldId, type: schema.type as 'string' | 'number'}
}

const updateJiraDimensionField = {
  type: GraphQLNonNull(UpdateJiraDimensionFieldPayload),
  description: `Set the jira field that the poker dimension should map to`,
  args: {
    dimensionName: {
      type: GraphQLNonNull(GraphQLString)
    },
    fieldName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The jira field name that we should push estimates to'
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The cloudId the field lives on'
    },
    projectKey: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The project the field lives on'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description:
        'The meeting the update happend in. Returns a meeting object with updated serviceField'
    }
  },
  resolve: async (
    _source,
    {dimensionName, fieldName, meetingId, cloudId, projectKey},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
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
    const {teamId, templateRefId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }
    const templateRef = await getTemplateRefById(templateRefId)
    const {dimensions} = templateRef
    const matchingDimension = dimensions.find((dimension) => dimension.name === dimensionName)
    if (!matchingDimension) {
      return {error: {message: 'Invalid dimension name'}}
    }

    // RESOLUTION
    const data = {teamId, meetingId}
    const team = await dataLoader.get('teams').load(teamId)
    const jiraDimensionFields = team.jiraDimensionFields || []
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

    const newField = new JiraDimensionField({
      dimensionName,
      fieldName,
      fieldId,
      cloudId,
      fieldType: type,
      projectKey
    })
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
      r
        .table('Team')
        .get(teamId)
        .update(updates)
        .run(),
      updateTeamByTeamId(updates, teamId)
    ])

    publish(SubscriptionChannel.TEAM, teamId, 'UpdateJiraDimensionFieldSuccess', data, subOptions)
    return data
  }
}

export default updateJiraDimensionField
