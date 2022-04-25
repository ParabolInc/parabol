//import stringify from 'fast-json-stable-stringify'
import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
//import {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import getRethink from '../../database/rethinkDriver'
//import {AzureDevOpsAuth} from '../../graphql/types/AzureDevOpsIntegration'
//import updateTeamByTeamId from '../../postgres/queries/updateTeamByTeamId'
//import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import {getUserId, isTeamMember} from '../../utils/authorization'
import upsertAzureDevOpsDimensionFieldMap from '../../postgres/queries/upsertAzureDevOpsDimensionFieldMap'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateAzureDevOpsDimensionFieldPayload from '../types/UpdateAzureDevOpsDimensionFieldPayload'
//import {AzureDevOpsDimensionField} from '../../postgres/queries/getTeamsByIds'
import MeetingPoker from '../../database/types/MeetingPoker'

const updateAzureDevOpsDimensionField = {
  type: new GraphQLNonNull(UpdateAzureDevOpsDimensionFieldPayload),
  description: `Set the Azure DevOps field that the poker dimension should map to`,
  args: {
    dimensionName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    fieldName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The jira field name that we should push estimates to'
    },
    instanceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The cloudId the field lives on'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The project the field lives on'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The meeting the update happend in. Returns a meeting object with updated serviceField'
    }
  },
  resolve: async (
    _source: unknown,
    {
      dimensionName,
      fieldName,
      meetingId,
      instanceId,
      projectKey
    }: {
      dimensionName: string
      fieldName: string
      instanceId: string
      projectKey: string
      meetingId: string
    },
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    console.log(`Entered updateAzureDevOpsDimensionField`)
    const r = await getRethink()
    console.log(`after getRethink()`)
    const operationId = dataLoader.share()
    console.log(`operationId:${operationId}`)
    const viewerId = getUserId(authToken)
    console.log(`viewerId:${viewerId}`)
    const subOptions = {mutatorId, operationId}

    // VALIDATION
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    console.log(`meeting:${meeting}`)
    if (!meeting) {
      return {error: {message: 'Invalid meetingId'}}
    }
    const {teamId, templateRefId} = meeting as MeetingPoker
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on team'}}
    }
    const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
    console.log(`templateRef:${templateRef}`)
    const {dimensions} = templateRef
    console.log(`dimensions:${dimensions}`)
    const matchingDimension = dimensions.find((dimension) => dimension.name === dimensionName)
    console.log(`matchingDimension:${matchingDimension}`)
    if (!matchingDimension) {
      return {error: {message: 'Invalid dimension name'}}
    }

    // RESOLUTION
    try {
      console.log(`calling upsertAzureDevOpsDimensionFieldMap`)
      await upsertAzureDevOpsDimensionFieldMap(teamId, dimensionName, fieldName, fieldName, instanceId, 'string', projectKey)
    } catch (e) {
      console.log(e)
    }

    const data = {teamId, meetingId}
    console.log(`data:${data}`)
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateAzureDevOpsDimensionFieldSuccess', data, subOptions)
    return data
  }
}

export default updateAzureDevOpsDimensionField
