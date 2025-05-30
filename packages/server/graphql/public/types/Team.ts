import {InsightId} from '../../../../client/shared/gqlIds/InsightId'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {selectPages} from '../../../postgres/select'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {TeamResolvers} from '../resolverTypes'

const Team: TeamResolvers = {
  viewerTeamMember: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    if (!viewerId) return null
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
    return teamMember
  },
  isViewerOnTeam: async ({id: teamId}, _args, {authToken}) => isTeamMember(authToken, teamId),
  tier: async ({orgId}, _args, {dataLoader}) => {
    const org = await dataLoader.get('organizations').loadNonNull(orgId)
    const {tier, trialStartDate} = org
    return getFeatureTier({tier, trialStartDate})
  },
  billingTier: async ({orgId}, _args, {dataLoader}) => {
    const org = await dataLoader.get('organizations').loadNonNull(orgId)
    const {tier} = org
    return tier
  },
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
  lastMetAt: async ({id: teamId}, _args, {dataLoader}) => {
    const [completedMeetings, activeMeetings] = await Promise.all([
      dataLoader.get('completedMeetingsByTeamId').load(teamId),
      dataLoader.get('activeMeetingsByTeamId').load(teamId)
    ])

    const dates = [
      ...completedMeetings.map((meeting) => new Date(meeting.endedAt || meeting.createdAt)),
      ...activeMeetings.map((meeting) => new Date(meeting.createdAt))
    ]

    if (dates.length === 0) return null
    return dates.reduce((latest, current) => (current > latest ? current : latest))
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
  },
  pages: async ({id: teamId}, {first, after}) => {
    const pagesPlusOne = await selectPages()
      .innerJoin('PageTeamAccess', 'PageTeamAccess.pageId', 'Page.id')
      .where('PageTeamAccess.teamId', '=', teamId)
      .$if(!!after, (qb) => qb.where('sortOrder', '>', after!))
      .orderBy('sortOrder')
      .limit(first + 1)
      .execute()
    const hasNextPage = pagesPlusOne.length > first
    const pages = hasNextPage ? pagesPlusOne.slice(0, -1) : pagesPlusOne
    return {
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: pages.at(0)?.sortOrder,
        endCursor: pages.at(-1)?.sortOrder
      },
      edges: pages.map((page) => ({
        node: page,
        cursor: page.sortOrder
      }))
    }
  },
  sortOrder: (source, _args) => {
    if ('sortOrder' in source) {
      return source.sortOrder as string
    }
    console.warn(
      'sortOrder is not being pre-calculated! Did you call teamsWithUserSort dataloader?'
    )
    return '!'
  }
}

export default Team
