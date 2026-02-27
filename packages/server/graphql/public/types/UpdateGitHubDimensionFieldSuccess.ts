import type {UpdateGitHubDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateGitHubDimensionFieldSuccessSource = {
  meetingId: string
  teamId: string
}

const UpdateGitHubDimensionFieldSuccess: UpdateGitHubDimensionFieldSuccessResolvers = {
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default UpdateGitHubDimensionFieldSuccess
