import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import type {AddAtlassianAuthPayloadResolvers} from '../resolverTypes'

export type AddAtlassianAuthPayloadSource =
  | {
      teamId: string
      userId: string
    }
  | {error: {message: string}}

const AddAtlassianAuthPayload: AddAtlassianAuthPayloadResolvers = {
  atlassianIntegration: async (source, _args, {dataLoader}) => {
    if (!('teamId' in source)) return null
    const res = await dataLoader
      .get('freshAtlassianAuth')
      .load({teamId: source.teamId, userId: source.userId})
    return res ?? null
  },

  teamMember: (source, _args, {dataLoader}) => {
    if (!('teamId' in source)) return null
    const teamMemberId = toTeamMemberId(source.teamId, source.userId)
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  },

  user: (source, _args, {dataLoader}) => {
    if (!('userId' in source)) return null
    return dataLoader.get('users').loadNonNull(source.userId)
  }
}

export default AddAtlassianAuthPayload
