import {PageId} from '../../../../client/shared/gqlIds/PageId'
import {PagePreviewId} from '../../../../client/shared/gqlIds/PagePreviewId'
import TeamMemberId from '../../../../client/shared/gqlIds/TeamMemberId'
import type {ReqResolvers} from './ReqResolvers'

const PagePartial: ReqResolvers<'PagePartial'> = {
  __resolveType: (source) =>
    (source as any).__typename === 'PagePreview' ? 'PagePreview' : 'Page',
  id: ({id, __typename}) =>
    __typename === 'PagePreview' ? PagePreviewId.join(id) : PageId.join(id),
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
