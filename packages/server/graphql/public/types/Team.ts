import {sql} from 'kysely'
import ms from 'ms'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {InsightId} from '../../../../client/shared/gqlIds/InsightId'
import {Security, Threshold} from '../../../../client/types/constEnums'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import generateRandomString from '../../../generateRandomString'
import getKysely from '../../../postgres/getKysely'
import {
  getUserId,
  isSuperUser,
  isTeamMember,
  isUserBillingLeader
} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import isValid from '../../isValid'
import connectionFromTasks from '../../queries/helpers/connectionFromTasks'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import type {TeamResolvers} from '../resolverTypes'

const Team: TeamResolvers = {
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
  agendaItems: ({id: teamId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return []
    return dataLoader.get('agendaItemsByTeamId').load(teamId)
  },
  billingTier: async ({orgId}, _args, {dataLoader}) => {
    const org = await dataLoader.get('organizations').loadNonNull(orgId)
    const {tier} = org
    return tier
  },
  featureFlag: async ({id: teamId}, {featureName}, {dataLoader}) => {
    return await dataLoader.get('featureFlagByOwnerId').load({ownerId: teamId, featureName})
  },
  insight: async ({id: teamId}, _args, {dataLoader}) => {
    const insight = await dataLoader.get('latestInsightByTeamId').load(teamId)
    if (!insight) return null
    return {
      ...insight,
      id: InsightId.join(teamId, insight.id)
    }
  },
  isOnboardTeam: ({isOnboardTeam}) => !!isOnboardTeam,
  isOrgAdmin: async ({orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({userId: viewerId, orgId})
    return organizationUser?.role === 'ORG_ADMIN'
  },
  isViewerLead: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return false
    const viewerId = getUserId(authToken)
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
    return teamMember.isLead && teamMember.isNotRemoved
  },
  isViewerOnTeam: async ({id: teamId}, _args, {authToken}) => isTeamMember(authToken, teamId),
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
  },
  meeting: async ({id: teamId}, {meetingId}, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return null
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (meeting && meeting.teamId === teamId) return meeting
    return null
  },
  meetingSettings: async ({id: teamId}, {meetingType}, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return null as any
    const settings = await dataLoader
      .get('meetingSettingsByType')
      .loadNonNull({teamId, meetingType})
    return settings
  },
  organization: async ({id: teamId, orgId}, _args, {authToken, dataLoader}) => {
    const organization = await dataLoader.get('organizations').loadNonNull(orgId)
    // TODO this is bad, we should probably just put the perms on each field in the org
    if (!isTeamMember(authToken, teamId)) {
      return {
        id: orgId,
        name: organization.name,
        isPaid: organization.isPaid,
        unpaidMessageHTML: organization.unpaidMessageHTML,
        useAI: organization.useAI
      } as any
    }
    return organization
  },
  retroMeetingsCount: async ({id: teamId}, _args, {dataLoader}) => {
    const meetings = await dataLoader.get('completedMeetingsByTeamId').load(teamId)
    const retroMeetings = meetings.filter((meeting) => meeting.meetingType === 'retrospective')
    return retroMeetings.length
  },
  scale: async ({id: teamId}, {scaleId}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const activeScales = await dataLoader.get('scalesByTeamId').load(teamId)
    const scale = activeScales.find(({id}: {id: string}) => id === scaleId)
    if (!scale) {
      standardError(new Error('Scale not found'), {userId: viewerId})
      return null
    }
    return scale
  },
  scales: async ({id: teamId}, _args, {dataLoader}) => {
    const availableScales = await dataLoader.get('scalesByTeamId').loadMany([teamId, 'aGhostTeam'])
    return availableScales.filter(isValid).flat()
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
  tasks: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) {
      const err = new Error('Team not found')
      standardError(err, {tags: {teamId}})
      return connectionFromTasks([], 0, err)
    }
    const viewerId = getUserId(authToken)
    const allTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    const tasks = allTasks.filter((task) => {
      if (!task.userId || (isTaskPrivate(task.tags) && task.userId !== viewerId)) return false
      return true
    })
    return connectionFromTasks(tasks)
  },
  teamInvitations: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) return []
    return dataLoader.get('teamInvitationsByTeamId').load(teamId)
  },
  teamLead: async ({id: teamId}, _args, {dataLoader}) => {
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    return teamMembers.find((teamMember) => teamMember.isLead)!
  },
  teamMembers: async ({id: teamId, orgId}, {sortBy = 'preferredName'}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const isBillingLeader = await isUserBillingLeader(viewerId, orgId, dataLoader)
    const canViewAllMembers =
      isBillingLeader || isSuperUser(authToken) || isTeamMember(authToken, teamId)
    if (!canViewAllMembers) return []
    const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
    const teamMembersWithUserFields = await Promise.all(
      teamMembers.map(async (teamMember) => {
        const user = await dataLoader.get('users').loadNonNull(teamMember.userId)
        return {
          ...teamMember,
          preferredName: user.preferredName,
          email: user.email
        }
      })
    )
    teamMembersWithUserFields.sort((a, b) => {
      let [aProp, bProp] = [a[sortBy as keyof typeof a], b[sortBy as keyof typeof a]]
      aProp = typeof aProp === 'string' ? aProp.toLowerCase() : aProp
      bProp = typeof bProp === 'string' ? bProp.toLowerCase() : bProp
      return aProp! > bProp! ? 1 : -1
    })
    return teamMembersWithUserFields
  },
  tier: async ({orgId}, _args, {dataLoader}) => {
    const org = await dataLoader.get('organizations').loadNonNull(orgId)
    const {tier, trialStartDate} = org
    return getFeatureTier({tier, trialStartDate})
  },
  viewerTeamMember: async ({id: teamId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    if (!viewerId) return null
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').loadNonNull(teamMemberId)
    return teamMember
  }
}

export default Team
