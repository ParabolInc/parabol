import type {UpdateIntegrationDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateIntegrationDimensionFieldSuccessSource = {
  teamId: string
  meetingId: string
}

const UpdateIntegrationDimensionFieldSuccess: UpdateIntegrationDimensionFieldSuccessResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId),
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'poker') throw new Error('Not a poker meeting')
    return meeting
  }
}

export default UpdateIntegrationDimensionFieldSuccess
