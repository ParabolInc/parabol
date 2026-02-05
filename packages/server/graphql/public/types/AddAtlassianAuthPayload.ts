import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import type {AddAtlassianAuthPayloadResolvers} from '../resolverTypes'

export type AddAtlassianAuthPayloadSource =
  | {
      teamId: string
      userId: string
    }
  | {error: {message: string}}

const AddAtlassianAuthPayload: AddAtlassianAuthPayloadResolvers = {
  atlassianIntegration: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {teamId, userId} = source
    return (await dataLoader.get('freshAtlassianAuth').load({teamId, userId})) ?? null
  },
  teamMember: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {teamId, userId} = source
    const teamMemberId = toTeamMemberId(teamId, userId)
    return (await dataLoader.get('teamMembers').load(teamMemberId)) ?? null
  },
  user: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return (await dataLoader.get('users').load(userId)) ?? null
  }
}

export default AddAtlassianAuthPayload
