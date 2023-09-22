import {TeamResolvers} from '../resolverTypes'
import TeamInsightsId from 'parabol-client/shared/gqlIds/TeamInsightsId'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {getUserId} from '../../../utils/authorization'

const Team: TeamResolvers = {
  insights: async ({id, orgId, mostUsedEmojis, meetingEngagement}, _args, {dataLoader}) => {
    const org = await dataLoader.get('organizations').load(orgId)
    console.log('GEORGIA', {id, orgId, mostUsedEmojis, meetingEngagement})
    if (!org?.featureFlags?.includes('teamInsights')) return null
    if (!mostUsedEmojis && !meetingEngagement) return null

    return {
      id: TeamInsightsId.join(id),
      mostUsedEmojis,
      meetingEngagement
    } as any
  },
  viewerTeamMember: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    if (!viewerId) return null
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    return teamMember
  }
}

export default Team
