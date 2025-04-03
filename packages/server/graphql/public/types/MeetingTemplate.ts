import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {getUserId} from '../../../utils/authorization'
import {MeetingTemplateResolvers} from '../resolverTypes'

const RECOMMENDED_TEMPLATES = ['startStopContinueTemplate', 'estimatedEffortTemplate']

const MeetingTemplate: MeetingTemplateResolvers = {
  category: ({mainCategory}, _args, _context) => mainCategory,
  isRecommended: ({id}, _args, _context) => {
    return RECOMMENDED_TEMPLATES.includes(id)
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  illustrationUrl: async ({illustrationUrl}, _args, {dataLoader}) => {
    return dataLoader.get('fileStoreAsset').load(illustrationUrl)
  },
  viewerLowestScope: async ({teamId, orgId}, _args, {authToken, dataLoader}) => {
    if (teamId === 'aGhostTeam') return 'PUBLIC'
    const viewerId = getUserId(authToken)
    const teamMemberId = TeamMemberId.join(teamId, viewerId)
    const [teamMember, orgUser] = await Promise.all([
      dataLoader.get('teamMembers').load(teamMemberId),
      dataLoader.get('organizationUsersByUserIdOrgId').load({
        orgId,
        userId: viewerId
      })
    ])
    const isViewerOnOwningTeam = teamMember && teamMember.isNotRemoved
    const isViewerAdmin =
      orgUser &&
      orgUser.removedAt === null &&
      (orgUser.role === 'ORG_ADMIN' || orgUser.role === 'BILLING_LEADER')
    // public user-defined templates are not visible outside their org
    return isViewerOnOwningTeam || isViewerAdmin ? 'TEAM' : 'ORGANIZATION'
  }
}

export default MeetingTemplate
