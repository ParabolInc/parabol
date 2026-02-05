import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import type {AddGitHubAuthPayloadResolvers} from '../resolverTypes'

export type AddGitHubAuthPayloadSource =
  | {
      teamId: string
      userId: string
    }
  | {error: {message: string}}

const AddGitHubAuthPayload: AddGitHubAuthPayloadResolvers = {
  githubIntegration: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {teamId, userId} = source
    return (await dataLoader.get('githubAuth').load({teamId, userId})) ?? null
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

export default AddGitHubAuthPayload
