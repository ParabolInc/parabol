import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import type {ReqResolvers} from './ReqResolvers'

const PagePartial: ReqResolvers<'PagePartial'> = {
  __resolveType: (source) =>
    (source as any).__typename === 'PagePreview' ? 'PagePreview' : 'Page',
  id: ({publicId, __typename}) => {
    const prefix = __typename === 'PagePreview' ? 'pagePreview' : 'page'
    return `${prefix}:${publicId}`
  },
  team: async ({teamId}, _args, {authToken, dataLoader}) => {
    if (!teamId) return null
    const [teamMember, team] = await Promise.all([
      dataLoader.get('teamMembers').load(TeamMemberId.join(teamId, authToken.sub)),
      dataLoader.get('teams').load(teamId)
    ])
    if (!team) return null
    const isOnTeam = teamMember?.isNotRemoved
    return {
      ...team,
      __typename: isOnTeam ? 'Team' : 'TeamPreview'
    }
  }
}

export default PagePartial
