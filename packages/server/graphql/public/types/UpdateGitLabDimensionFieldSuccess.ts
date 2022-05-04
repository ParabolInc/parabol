import {UpdateGitLabDimensionFieldSuccessResolvers} from '../resolverTypes'

export type UpdateGitLabDimensionFieldSuccessSource = {
  teamId: string
  meetingId: string
}

const UpdateGitLabDimensionFieldSuccess: UpdateGitLabDimensionFieldSuccessResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('teams').loadNonNull(teamId)[0]
  },
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId)
  }
}

export default UpdateGitLabDimensionFieldSuccess
