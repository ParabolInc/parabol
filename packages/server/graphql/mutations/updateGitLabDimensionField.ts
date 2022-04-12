import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingPoker from '../../database/types/MeetingPoker'
import upsertGitLabDimensionFieldMap from '../../postgres/queries/upsertGitLabDimensionFieldMap'
import {isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateGitLabDimensionFieldPayload from '../types/UpdateGitLabDimensionFieldPayload'

interface Args {
  dimensionName: string
  labelTemplate: string
  gid: string
  meetingId: string
}

const updateGitLabDimensionField = {
  type: new GraphQLNonNull(UpdateGitLabDimensionFieldPayload),
  description: `Update how a parabol dimension maps to a GitLab label`,
  args: {
    dimensionName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    labelTemplate: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The template string to map to a label'
    },
    gid: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The unique global id of the issue'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The meeting the update happend in. Returns a meeting object with updated serviceField'
    }
  },
  resolve: async (
    _source: unknown,
    {dimensionName, labelTemplate, meetingId, gid}: Args,
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

    // RESOLUTION
    try {
      await upsertGitLabDimensionFieldMap(teamId, dimensionName, gid, labelTemplate)
    } catch (e) {
      console.log(e)
    }

    const data = {meetingId, teamId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateGitLabDimensionFieldSuccess', data, subOptions)
    return data
  }
}

export default updateGitLabDimensionField
