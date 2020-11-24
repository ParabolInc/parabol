import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import JiraDimensionField from '../../database/types/JiraDimensionField'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateJiraDimensionFieldPayload from '../types/UpdateJiraDimensionFieldPayload'

const updateJiraDimensionField = {
  type: GraphQLNonNull(UpdateJiraDimensionFieldPayload),
  description: `Set the jira field that the poker dimension should map to`,
  args: {
    dimensionId: {
      type: GraphQLNonNull(GraphQLID)
    },
    fieldName: {
      type: GraphQLNonNull(GraphQLString),
      description: 'The jira field name that we should push estimates to'
    },
    cloudId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The cloudId the field lives on'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description:
        'The meeting the update happend in. If present, can return a meeting object with updated serviceField'
    }
  },
  resolve: async (
    _source,
    {dimensionId, fieldName, meetingId, cloudId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const viewerId = getUserId(authToken)
    const subOptions = {mutatorId, operationId}

    // VALIDATION
    const dimension = await dataLoader.get('templateDimensions').load(dimensionId)
    if (!dimension || dimension.removedAt) {
      return {error: {message: 'Dimension not found'}}
    }

    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return {error: {message: 'Invalid meetingId'}}
    }
    const {teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }

    // RESOLUTION
    const data = {teamId, meetingId}
    const team = await dataLoader.get('teams').load(teamId)
    const jiraDimensionFields = team.jiraDimensionFields || []
    const existingDimensionField = jiraDimensionFields.find(
      (dimensionField) =>
        dimensionField.dimensionId === dimensionId && dimensionField.cloudId === cloudId
    )
    if (existingDimensionField) {
      if (existingDimensionField.fieldName === fieldName) {
        return data
      }
      existingDimensionField.fieldName = fieldName
    } else {
      const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
      if (!auth) {
        return {error: {message: 'Not authenticated with Jira'}}
      }
      const {accessToken} = auth
      const manager = await new AtlassianServerManager(accessToken)
      const fields = await manager.getFields(cloudId)
      const field = fields.find((field) => field.name === fieldName)
      if (!field) return {error: {message: 'Invalid field name'}}
      const {id: fieldId, schema} = field
      const type = schema.type as 'string' | 'number'
      jiraDimensionFields.push(
        new JiraDimensionField({dimensionId, fieldName, fieldId, cloudId, fieldType: type})
      )
    }
    const MAX_JIRA_DIMENSION_FIELDS = 100 // prevent a-holes from unbounded growth of the Team object
    await r
      .table('Team')
      .get(teamId)
      .update({
        jiraDimensionFields: jiraDimensionFields.slice(
          jiraDimensionFields.length - MAX_JIRA_DIMENSION_FIELDS
        )
      })
      .run()

    publish(SubscriptionChannel.TEAM, teamId, 'UpdateJiraDimensionFieldSuccess', data, subOptions)
    return data
  }
}

export default updateJiraDimensionField
