import {UpdateLinearDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateLinearDimensionFieldSuccessSource = {
  teamId: string
  meetingId: string
}

const UpdateLinearDimensionFieldSuccess: UpdateLinearDimensionFieldSuccessResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    if (typeof teamId !== 'string') {
      throw new Error(
        'Invariant: teamId was missing or invalid for UpdateLinearDimensionFieldSuccess resolver.'
      )
    }
    return await dataLoader.get('teams').loadNonNull(teamId)
  },
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    if (typeof meetingId !== 'string') {
      throw new Error(
        'Invariant: meetingId was missing or invalid for UpdateLinearDimensionFieldSuccess resolver.'
      )
    }
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default UpdateLinearDimensionFieldSuccess
