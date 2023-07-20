import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import isValid from '../../isValid'
import {UpdateUserProfilePayloadResolvers} from '../resolverTypes'

export type UpdateUserProfilePayloadSource =
  | {
      userId: string
      teamIds: string[]
    }
  | {error: {message: string}}

const UpdateUserProfilePayload: UpdateUserProfilePayloadResolvers = {
  user: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {userId} = source
    return dataLoader.get('users').loadNonNull(userId)
  },
  teamMembers: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {teamIds, userId} = source
    if (!teamIds) return []
    const teamMemberIds = teamIds.map((teamId) => toTeamMemberId(teamId, userId))
    const teamMembers = await dataLoader.get('teamMembers').loadMany(teamMemberIds)
    return teamMembers.filter(isValid)
  }
}

export default UpdateUserProfilePayload
