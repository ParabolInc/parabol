import {PokerMeeting, UpdateDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateDimensionFieldSuccessSource =
{
  teamId: string
  meetingId: string
}

const UpdateDimensionFieldSuccess: UpdateDimensionFieldSuccessResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').load(teamId),
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return (await dataLoader.get('newMeetings').load(meetingId))
  }
}

export default UpdateDimensionFieldSuccess

