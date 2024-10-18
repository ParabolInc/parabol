import {UpdateDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateDimensionFieldSuccessSource = {
  teamId: string
  meetingId: string
}

const UpdateDimensionFieldSuccess: UpdateDimensionFieldSuccessResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId),
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'poker') throw new Error('Not a poker meeting')
    return meeting
  }
}

export default UpdateDimensionFieldSuccess
