import {UpdateGitLabDimensionFieldPayloadResolvers} from '../resolverTypes'

export type UpdateGitLabDimensionFieldPayloadSource =
  | {
      teamId: string
      meetingId: string
    }
  | {error: {message: string}}

const UpdateGitLabDimensionFieldPayload: UpdateGitLabDimensionFieldPayloadResolvers = {
  team: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {teamId} = source
    return dataLoader.get('teams').load(teamId)
  },
  meeting: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {meetingId} = source
    if (!meetingId) return null
    return dataLoader.get('newMeetings').load(meetingId)
  }
}

export default UpdateGitLabDimensionFieldPayload
