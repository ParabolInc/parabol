import {sql} from 'kysely'
import ms from 'ms'
import {InsightId} from '../../../../client/shared/gqlIds/InsightId'
import {Security, Threshold} from '../../../../client/types/constEnums'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import generateRandomString from '../../../generateRandomString'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import type {TeamResolvers} from '../resolverTypes'

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
  sortOrder: (source, _args) => {
    if ('sortOrder' in source) {
      return source.sortOrder as string
    }
    console.warn(
      'sortOrder is not being pre-calculated! Did you call teamsWithUserSort dataloader?'
    )
    return '!'
  },
  activeMeetings: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return []
    // this is by team, not by meeting member, which caused an err in dev, not sure about prod
    // we need better perms for people to view/not view a meeting that happened before they joined the team
    return dataLoader.get('activeMeetingsByTeamId').load(teamId)
  },
  activeMeetingSeries: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return []
    return dataLoader.get('activeMeetingSeriesByTeamId').load(teamId)
  },
  massInvitation: async ({id: teamId}, {meetingId}, {authToken, dataLoader}) => {
    const pg = getKysely()
    const viewerId = getUserId(authToken)
    const invitationTokens = await dataLoader
      .get('massInvitationsByTeamIdUserId')
      .load({teamId, userId: viewerId})
    const matchingInvitation = invitationTokens.find((token) => token.meetingId === meetingId)
    if (matchingInvitation) {
      // if the token is < 5 mins old return it
      const createdAt =
        matchingInvitation.expiration.getTime() - Threshold.MASS_INVITATION_TOKEN_LIFESPAN
      if (createdAt > Date.now() - ms('5m')) {
        return matchingInvitation
      }
    }

    // if there is no matching token, let's use the opportunity to clean up old tokens
    if (invitationTokens.length > 0) {
      await pg
        .deleteFrom('MassInvitation')
        .where('userId', '=', viewerId)
        .where('teamId', '=', teamId)
        .where('expiration', '<', sql<Date>`CURRENT_TIMESTAMP`)
        .execute()
    }
    const massInvitation = {
      id: generateRandomString(Security.MASS_INVITATION_TOKEN_LENGTH),
      meetingId,
      teamId,
      userId: viewerId,
      expiration: new Date(Date.now() + Threshold.MASS_INVITATION_TOKEN_LIFESPAN)
    }
    await pg.insertInto('MassInvitation').values(massInvitation).execute()
    dataLoader.get('massInvitationsByTeamIdUserId').clearAll()
    return massInvitation
  }
}

export default Team
