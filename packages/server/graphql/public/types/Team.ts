import TeamInsightsId from 'parabol-client/shared/gqlIds/TeamInsightsId'
import {InsightId} from '../../../../client/shared/gqlIds/InsightId'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {TeamResolvers} from '../resolverTypes'

const Team: TeamResolvers = {
  insights: async (
    {id, orgId, mostUsedEmojis, meetingEngagement, topRetroTemplates},
    _args,
    {dataLoader}
  ) => {
    const noTeamInsights = await dataLoader
      .get('featureFlagByOwnerId')
      .load({ownerId: orgId, featureName: 'noTeamInsights'})

    if (noTeamInsights) return null
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
    const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
    return teamMember
  },
  isViewerOnTeam: async ({id: teamId}, _args, {authToken}) => isTeamMember(authToken, teamId),
  tier: ({tier, trialStartDate}) => {
    return getFeatureTier({tier, trialStartDate})
  },
  billingTier: ({tier}) => tier,
  isOrgAdmin: async ({orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({userId: viewerId, orgId})
    return organizationUser?.role === 'ORG_ADMIN'
  },
  teamLead: async ({id: teamId}, _args, {dataLoader}) => {
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    return teamMembers.find((teamMember) => teamMember.isLead)!
  },
  retroMeetingsCount: async ({id: teamId}, _args, {dataLoader}) => {
    const meetings = await dataLoader.get('completedMeetingsByTeamId').load(teamId)
    const retroMeetings = meetings.filter((meeting) => meeting.meetingType === 'retrospective')
    return retroMeetings.length
  },
  insight: async ({id: teamId}, _args, {dataLoader}) => {
    const insight = await dataLoader.get('latestInsightByTeamId').load(teamId)
    if (!insight) return null
    return {
      ...insight,
      id: InsightId.join(teamId, insight.id)
    }
  },
  featureFlag: async ({id: teamId}, {featureName}, {dataLoader}) => {
    return await dataLoader.get('featureFlagByOwnerId').load({ownerId: teamId, featureName})
  }
}

export default Team
