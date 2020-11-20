import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import JiraDimensionField from '../../database/types/JiraDimensionField'
import {isTeamMember} from '../../utils/authorization'
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
    meetingId: {
      type: GraphQLID,
      description:
        'The meeting the update happend in. If present, can return a meeting object with updated serviceFieldName'
    }
  },
  resolve: async (
    _source,
    {dimensionId, fieldName, meetingId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // VALIDATION
    const dimension = await dataLoader.get('templateDimensions').load(dimensionId)
    if (!dimension || dimension.removedAt) {
      return {error: {message: 'Dimension not found'}}
    }

    const {teamId} = dimension
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }

    if (meetingId) {
      const meeting = await dataLoader.get('newMeetings').load(meetingId)
      if (!meeting || meeting.teamId !== teamId) {
        return {error: {message: 'Invalid meetingId'}}
      }
    }
    // No sense in validating the fieldName beause they could delete it right after this & it'd be invalid
    // and jira doesn't do webhooks so we can't even trust that it is valid

    // RESOLUTION
    const data = {teamId, meetingId}
    const team = await dataLoader.get('teams').load(teamId)
    const jiraDimensionFields = team.jiraDimensionFields || []
    const existingDimensionField = jiraDimensionFields.find(
      (dimensionField) => dimensionField.dimensionId === dimensionId
    )
    if (existingDimensionField) {
      if (existingDimensionField.fieldName === fieldName) {
        return data
      }
      existingDimensionField.fieldName = fieldName
    } else {
      jiraDimensionFields.push(new JiraDimensionField({dimensionId, fieldName}))
    }

    await r
      .table('Team')
      .get(teamId)
      .update({
        jiraDimensionFields
      })
      .run()

    publish(SubscriptionChannel.TEAM, teamId, 'UpdateJiraDimensionFieldSuccess', data, subOptions)
    return data
  }
}

export default updateJiraDimensionField
