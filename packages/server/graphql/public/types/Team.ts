import {TeamResolvers} from '../resolverTypes'
import TeamInsightsId from 'parabol-client/shared/gqlIds/TeamInsightsId'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

const Team: TeamResolvers = {
  insights: async (
    {id, orgId, mostUsedEmojis, meetingEngagement, topRetroTemplates},
    _args,
    {dataLoader}
  ) => {
    const org = await dataLoader.get('organizations').load(orgId)
    if (!org?.featureFlags?.includes('teamInsights')) return null
    if (!mostUsedEmojis && !meetingEngagement && !topRetroTemplates) return null

    const mappedTopRetroTemplates = Array.isArray(topRetroTemplates)
      ? topRetroTemplates.map((template) => ({
          ...(template as any),
          teamId: id
        }))
      : null
    mappedTopRetroTemplates?.sort((a, b) => b.count - a.count)

    return {
      id: TeamInsightsId.join(id),
      mostUsedEmojis,
      meetingEngagement,
      topRetroTemplates: mappedTopRetroTemplates
    } as any
  },
  viewerTeamMember: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    if (!viewerId) return null
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    return teamMember
  },
  isViewerOnTeam: async ({id: teamId}, _args, {authToken}) => isTeamMember(authToken, teamId),
  tier: ({tier, trialStartDate}) => {
    return getFeatureTier({tier, trialStartDate})
  },
  billingTier: ({tier}) => tier
}

export default Team
