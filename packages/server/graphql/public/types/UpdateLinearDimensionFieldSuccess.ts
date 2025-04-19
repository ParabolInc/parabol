import {UpdateLinearDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateLinearDimensionFieldSuccessSource = {
  teamId: string
  meetingId: string
}

const UpdateLinearDimensionFieldSuccess: UpdateLinearDimensionFieldSuccessResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('teams').loadNonNull(teamId)
  },
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default UpdateLinearDimensionFieldSuccess
