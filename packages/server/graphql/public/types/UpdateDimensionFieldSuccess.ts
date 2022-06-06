import MeetingPoker from '../../../database/types/MeetingPoker'
import {UpdateDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateDimensionFieldSuccessSource = {
  teamId: string
  meetingId: string
}

const UpdateDimensionFieldSuccess: UpdateDimensionFieldSuccessResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId),
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingPoker
  }
}

export default UpdateDimensionFieldSuccess
