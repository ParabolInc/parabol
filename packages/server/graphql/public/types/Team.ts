import TeamInsightsId from 'parabol-client/shared/gqlIds/TeamInsightsId'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {TeamResolvers} from '../resolverTypes'

const Team: TeamResolvers = {
  insights: async (
    {id, orgId, mostUsedEmojis, meetingEngagement, topRetroTemplates},
    _args,
    {dataLoader}
  ) => {
    const org = await dataLoader.get('organizations').load(orgId)
    if (org?.featureFlags?.includes('noTeamInsights')) return null
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
  insight: async ({id: teamId}, _args, {dataLoader}) => {
    const pg = getKysely()
    const insights = await pg
      .selectFrom('Insight')
      .where('teamId', '=', teamId)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .execute()
    console.log('🚀 ~ insights:', insights)
    const example = {
      id: 'example-id',
      wins: [
        'The team is actively discussing and seeking clarity on prioritizing interruptive work during Shape Up cycles, which shows a commitment to improving workflow efficiency ([link](https://action.parabol.co/meet/wmkvIFZqMg/discuss/1)).',
        'There is a focus on improving transparency in the betting process, indicating a desire for better collaboration and communication within the team ([link](https://action.parabol.co/meet/wmkvIFZqMg/discuss/2)).',
        'Team morale is a priority, as evidenced by the positive feedback about the San Diego retreat, which was described as a morale booster ([link](https://action.parabol.co/meet/wMqtYufJK0/discuss/5)).'
      ],
      challenges: [
        "There is ongoing fiscal pressure and concerns about fundraising and the runway, which has been described as a 'stormy cloud' ([link](https://action.parabol.co/meet/wMqtYufJK0/discuss/2)).",
        'Uncertainty about how to prioritize interruptive work during Shape Up cycles remains a challenge, as noted by an anonymous participant ([link](https://action.parabol.co/meet/wmkvIFZqMg/discuss/1)).'
      ]
    }
    return example
  }
}

export default Team
