import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import {CipherId} from '../../../utils/CipherId'
import type {ReqResolvers} from './ReqResolvers'

const PagePartial: ReqResolvers<'PagePartial'> = {
  __resolveType: (source) =>
    (source as any).__typename === 'PagePreview' ? 'PagePreview' : 'Page',
  id: ({id, __typename}) => {
    const prefix = __typename === 'PagePreview' ? 'pagePreview' : 'page'
    return CipherId.toClient(id, prefix)
  },
  team: async ({teamId}, _args, {authToken, dataLoader}) => {
    if (!teamId) return null
    const [teamMember, team] = await Promise.all([
      dataLoader.get('teamMembers').load(TeamMemberId.join(teamId, authToken.sub)),
      dataLoader.get('teams').load(teamId)
    ])
    if (!team) return null
    return {
      ...team,
      __typename: teamMember ? 'Team' : 'TeamPreview'
    }
  }
}

export default PagePartial
