import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import {getUserId} from '../../../utils/authorization'
import {MeetingTemplateResolvers} from '../resolverTypes'

const RECOMMENDED_TEMPLATES = [
  'teamCharterTemplate',
  'startStopContinueTemplate',
  'estimatedEffortTemplate',
  'incidentResponsePostmortemTemplate',
  'successAndFailurePremortemTemplate'
]

const MeetingTemplate: MeetingTemplateResolvers = {
  category: ({mainCategory}, _args, _context) => mainCategory,
  isRecommended: ({id}, _args, _context) => {
    return RECOMMENDED_TEMPLATES.includes(id)
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  viewerLowestScope: async ({teamId}, _args, {authToken, dataLoader}) => {
    if (teamId === 'aGhostTeam') return 'PUBLIC'
    const viewerId = getUserId(authToken)
    const teamMemberId = TeamMemberId.join(teamId, viewerId)
    const team = await dataLoader.get('teamMembers').load(teamMemberId)
    const isViewerOnOwningTeam = !!team
    // public user-defined templates are not visible outside their org
    return isViewerOnOwningTeam ? 'TEAM' : 'ORGANIZATION'
  }
}

export default MeetingTemplate
