import type {UpdateAzureDevOpsDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateAzureDevOpsDimensionFieldSuccessSource = {
  meetingId: string
  teamId: string
}

const UpdateAzureDevOpsDimensionFieldSuccess: UpdateAzureDevOpsDimensionFieldSuccessResolvers = {
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default UpdateAzureDevOpsDimensionFieldSuccess
