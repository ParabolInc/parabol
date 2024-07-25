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
  viewerLowestScope: async ({teamId}, _args, {authToken, dataLoader}) => {
    if (teamId === 'aGhostTeam') return 'PUBLIC'
    const viewerId = getUserId(authToken)
    const teamMemberId = TeamMemberId.join(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    const isViewerOnOwningTeam = teamMember && teamMember.isNotRemoved
    // public user-defined templates are not visible outside their org
    return isViewerOnOwningTeam ? 'TEAM' : 'ORGANIZATION'
  }
}

export default MeetingTemplate
