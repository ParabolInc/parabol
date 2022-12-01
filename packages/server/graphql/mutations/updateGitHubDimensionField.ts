import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingPoker from '../../database/types/MeetingPoker'
import upsertGitHubDimensionFieldMap from '../../postgres/queries/upsertGitHubDimensionFieldMap'
import {isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateGitHubDimensionFieldPayload from '../types/UpdateGitHubDimensionFieldPayload'

interface Args {
  dimensionName: string
  labelTemplate: string
  nameWithOwner: string
  meetingId: string
}

const updateGitHubDimensionField = {
  type: new GraphQLNonNull(UpdateGitHubDimensionFieldPayload),
  description: `Update how a parabol dimension maps to a GitHub label`,
  args: {
    dimensionName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    labelTemplate: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The template string to map to a label'
    },
    nameWithOwner: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The repo the issue lives on'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The meeting the update happend in. Returns a meeting object with updated serviceField'
    }
  },
  resolve: async (
    _source: unknown,
    {dimensionName, labelTemplate, meetingId, nameWithOwner}: Args,
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const operationId = dataLoader.share()
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

    // TODO validate labelTemplate
    // no sense in validating nameWithOwner because that could become invalid at any time

    // RESOLUTION
    try {
      await upsertGitHubDimensionFieldMap(teamId, dimensionName, nameWithOwner, labelTemplate)
    } catch (e) {
      console.log(e)
    }

    const data = {meetingId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateGitHubDimensionFieldSuccess', data, subOptions)
    return data
  }
}

export default updateGitHubDimensionField
