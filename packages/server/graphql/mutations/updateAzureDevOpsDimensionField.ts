import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingPoker from '../../database/types/MeetingPoker'
import upsertAzureDevOpsDimensionFieldMap, {
  AzureDevOpsFieldMapProps
} from '../../postgres/queries/upsertAzureDevOpsDimensionFieldMap'
import {isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import UpdateAzureDevOpsDimensionFieldPayload from '../types/UpdateAzureDevOpsDimensionFieldPayload'

const updateAzureDevOpsDimensionField = {
  type: new GraphQLNonNull(UpdateAzureDevOpsDimensionFieldPayload),
  description: `Set the Azure DevOps field that the poker dimension should map to`,
  args: {
    dimensionName: {
      type: new GraphQLNonNull(GraphQLString)
    },
    fieldName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The Azure DevOps field name that we should push estimates to'
    },
    instanceId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The Azure DevOps instanceId the field lives on'
    },
    projectKey: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The project the field lives on'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description:
        'The meeting the update happend in. Returns a meeting object with updated serviceField'
    },
    workItemType: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The work item type in Azure DevOps'
    }
  },
  resolve: async (
    _source: unknown,
    {
      dimensionName,
      fieldName,
      meetingId,
      instanceId,
      projectKey,
      workItemType
    }: {
      dimensionName: string
      fieldName: string
      instanceId: string
      projectKey: string
      meetingId: string
      workItemType: string
    },
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    //console.log(`Inside updateAzureDevOpsDimensionField`)
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

    // RESOLUTION
    try {
      const props = {
        teamId,
        dimensionName,
        fieldName,
        fieldId: fieldName,
        instanceId,
        fieldType: 'string',
        projectKey,
        workItemType
      } as AzureDevOpsFieldMapProps
      await upsertAzureDevOpsDimensionFieldMap(props)
    } catch (e) {
      console.log(e)
    }

    const data = {teamId, meetingId}
    console.log(`data - ${JSON.stringify(data)}`)
    publish(
      SubscriptionChannel.TEAM,
      teamId,
      'UpdateAzureDevOpsDimensionFieldSuccess',
      data,
      subOptions
    )
    return data
  }
}

export default updateAzureDevOpsDimensionField
