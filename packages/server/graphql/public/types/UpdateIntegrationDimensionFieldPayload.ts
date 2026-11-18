import {GraphQLError} from 'graphql'
import type {UpdateIntegrationDimensionFieldPayloadResolvers} from '../resolverTypes'

export type UpdateIntegrationDimensionFieldPayloadSource = {
  teamId: string
  meetingId: string
}

const UpdateIntegrationDimensionFieldPayload: UpdateIntegrationDimensionFieldPayloadResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId),
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'poker')
      throw new GraphQLError('Not a poker meeting', {extensions: {code: 'INTERNAL_SERVER_ERROR'}})
    return meeting
  }
}

export default UpdateIntegrationDimensionFieldPayload
