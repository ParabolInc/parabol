import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import type {RemoveAtlassianAuthPayloadResolvers} from '../resolverTypes'

export type RemoveAtlassianAuthPayloadSource =
  | {teamId: string; userId: string}
  | {error: {message: string}}

const RemoveAtlassianAuthPayload: RemoveAtlassianAuthPayloadResolvers = {
  teamMember: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const teamMemberId = TeamMemberId.join(source.teamId, source.userId)
    return (await dataLoader.get('teamMembers').load(teamMemberId)) ?? null
  },
  user: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return (await dataLoader.get('users').load(source.userId)) ?? null
  }
}

export default RemoveAtlassianAuthPayload
