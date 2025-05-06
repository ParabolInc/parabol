import AuthToken from '../../../database/types/AuthToken'
import getKysely from '../../../postgres/getKysely'
import {TeamMember} from '../../../postgres/types'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import errorFilter from '../../errorFilter'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import {CompanyResolvers} from '../resolverTypes'
import getActiveTeamCountByOrgIds from './helpers/getActiveTeamCountByOrgIds'

export type CompanySource = {id: string}

const getSuggestedTierOrganizations = async (
  domain: string,
  authToken: AuthToken,
  dataLoader: DataLoaderWorker
) => {
  const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
  const orgIds = organizations.map(({id}) => id)
  const viewerId = getUserId(authToken)
  const allOrganizationUsers = (
    await Promise.all(
      orgIds.map((orgId) => {
        return dataLoader.get('organizationUsersByUserIdOrgId').load({orgId, userId: viewerId})
      })
    )
  ).filter(isValid)
  // If suggestedTier === enterprise, that means the user is allowed to see across
  // all organizations, even the ones they are not a member of!
  // Super users are also allowed to see all organizations
  const isViewerAllowedToSeeAll =
    isSuperUser(authToken) ||
    allOrganizationUsers.some(
      ({suggestedTier, tier}) => suggestedTier === 'enterprise' || tier === 'enterprise'
    )
  if (isViewerAllowedToSeeAll) return organizations
  // Pro-qualified or unqualified users can only see orgs that they are apart of
  const allowedOrgIds = allOrganizationUsers.map(({orgId}) => orgId)
  return organizations.filter((organization) => allowedOrgIds.includes(organization.id))
}

const Company: CompanyResolvers = {
  activeTeamCount: async ({id: domain}, _args, {authToken, dataLoader}) => {
    // get the organizations
    const organizations = await getSuggestedTierOrganizations(domain, authToken, dataLoader)
    // get unarchivedTeams
    const orgIds = organizations.map(({id}) => id)
    return getActiveTeamCountByOrgIds(orgIds)
  },

  activeUserCount: async ({id: domain}, {after}, {authToken, dataLoader}) => {
    // number of users on an active organization that has logged in within the last 30 days
    const organizations = await getSuggestedTierOrganizations(domain, authToken, dataLoader)
    const orgIds = organizations.map(({id}) => id)
    const organizationUsers = (await dataLoader.get('organizationUsersByOrgId').loadMany(orgIds))
      .filter(isValid)
      .flat()
    const activeOrganizationUsers = organizationUsers.filter((organizationUser) => {
      const isActive = !organizationUser.inactive
      const joinedAfter = after ? organizationUser.joinedAt > new Date(after) : true
      return isActive && joinedAfter
    })
    const userIds = activeOrganizationUsers.map((organizationUser) => organizationUser.userId)
    const uniqueUserIds = new Set(userIds)
    return uniqueUserIds.size
  },
  activeOrganizationCount: async ({id: domain}, _args, {authToken, dataLoader}) => {
    // organizations with at least 1 unarchived team on it, which has at least 2 team members who have logged in within the last 30 days

    // get the organizations
    const organizations = await getSuggestedTierOrganizations(domain, authToken, dataLoader)
    const allOrgIds = organizations.map(({id}) => id)
    // get the organizationUsers
    const organizationUsers = (await dataLoader.get('organizationUsersByOrgId').loadMany(allOrgIds))
      .flat()
      .filter(isValid)
    const activeOrganizationUsers = organizationUsers.filter(
      (organizationUser) => !organizationUser.inactive
    )
    // if there aren't 2 active users, abort
    if (activeOrganizationUsers.length < 2) return 0
    // get the unarchived teams
    const unarchivedTeams = (await dataLoader.get('teamsByOrgIds').loadMany(allOrgIds))
      .filter(isValid)
      .flat()
    // if there aren't any unarchived teams, abort
    if (unarchivedTeams.length === 0) return 0
    // create teamMemberIds
    const teamIds = unarchivedTeams.map(({id}) => id)
    // get the teamMembers by teamId, userId
    const teamMembers = (await dataLoader.get('teamMembersByTeamId').loadMany(teamIds))
      .flat()
      .filter(isValid)
    // group by teamId
    const teamMembersByTeamId = teamMembers.reduce(
      (obj, teamMember) => {
        if (obj[teamMember.teamId]) {
          obj[teamMember.teamId]!.push(teamMember)
        } else {
          obj[teamMember.teamId] = [teamMember]
        }
        return obj
      },
      {} as Record<string, [TeamMember, ...TeamMember[]]>
    )

    // filter out teams that have less than 2 unremoved team members
    const teamsWithSufficientTeamMembers = Object.values(teamMembersByTeamId)
      .map((teamMembers) => {
        return {
          count: teamMembers.length,
          team: unarchivedTeams.find((team) => team.id === teamMembers[0].teamId)!
        }
      })
      .filter((agg) => agg.count >= 2)
      .map((agg) => agg.team)
    // for each remaining teamId, get the orgId
    // make a set of the orgIds
    const orgsIdsWithSufficientTeamMembers = [
      ...new Set(teamsWithSufficientTeamMembers.map((team) => team.orgId))
    ]
    return orgsIdsWithSufficientTeamMembers.length
  },
  lastMetAt: async ({id: domain}, _args, {authToken, dataLoader}) => {
    const pg = getKysely()
    const organizations = await getSuggestedTierOrganizations(domain, authToken, dataLoader)
    const orgIds = organizations.map(({id}) => id)
    const teams = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(isValid).flat()
    const teamIds = teams.map(({id}) => id)
    if (teamIds.length === 0) return null
    const lastMetAt = await pg
      .selectFrom('NewMeeting')
      .select('createdAt')
      .where('teamId', 'in', teamIds)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .executeTakeFirst()
    return lastMetAt?.createdAt ?? null
  },

  meetingCount: async ({id: domain}, {after}, {authToken, dataLoader}) => {
    // number of meetings created by teams on organizations assigned to the domain
    const pg = getKysely()
    const organizations = await getSuggestedTierOrganizations(domain, authToken, dataLoader)
    const orgIds = organizations.map(({id}) => id)
    const teams = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(isValid).flat()
    const teamIds = teams.map(({id}) => id)
    if (teamIds.length === 0) return 0
    const res = await pg
      .selectFrom('NewMeeting')
      .select(({fn}) => fn.count('id').as('count'))
      .where('teamId', 'in', teamIds)
      .$if(!!after, (qb) => qb.where('createdAt', '>=', after!))
      .executeTakeFirstOrThrow()
    return res.count ? Number(res.count) : 0
  },

  monthlyTeamStreakMax: async ({id: domain}, _args, {authToken, dataLoader}) => {
    const organizations = await getSuggestedTierOrganizations(domain, authToken, dataLoader)
    const orgIds = organizations.map(({id}) => id)
    const teams = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(isValid).flat()
    const teamIds = teams.map(({id}) => id)
    if (teamIds.length === 0) return 0
    const completedMeetingsRes = await dataLoader.get('completedMeetingsByTeamId').loadMany(teamIds)
    const endTimes = completedMeetingsRes
      .filter(isValid)
      .flat()
      .map(({endedAt}) => endedAt!)
      .sort((a, b) => (a.getTime() < b.getTime() ? -1 : 1))

    let longestStreak = 1
    let currentStreak = 1

    // Step 2: Traverse the sorted array and count streaks of consecutive months
    for (let i = 1; i < endTimes.length; i++) {
      const prevDate = endTimes[i - 1]!
      const currDate = endTimes[i]!

      // Calculate year and month differences
      const yearDiff = currDate.getFullYear() - prevDate.getFullYear()
      const monthDiff = currDate.getMonth() - prevDate.getMonth()

      // Step 3: Check if dates are consecutive months
      if ((yearDiff === 0 && monthDiff === 1) || (yearDiff === 1 && monthDiff === -11)) {
        currentStreak++
      } else {
        // Reset streak if not consecutive
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
      }
    }

    // Step 4: Ensure the last streak is accounted for
    longestStreak = Math.max(longestStreak, currentStreak)
    return longestStreak
  },

  organizations: async ({id: domain}, _args, {authToken, dataLoader}) => {
    return getSuggestedTierOrganizations(domain, authToken, dataLoader)
  },

  suggestedTier: async ({id: domain}, _args, {dataLoader}) => {
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
    const orgIds = organizations.map(({id}) => id)
    const organizationUsers = (await dataLoader.get('organizationUsersByOrgId').loadMany(orgIds))
      .filter(isValid)
      .flat()

    const tiers = [
      ...new Set(organizationUsers.map(({suggestedTier}) => suggestedTier).filter(isValid))
    ]
    if (tiers.includes('enterprise')) return 'enterprise'
    if (tiers.includes('team')) return 'team'
    return 'starter'
  },

  tier: async ({id: domain}, _args, {dataLoader}) => {
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
    const tiers = organizations.map(({tier}) => tier)
    if (tiers.includes('enterprise')) return 'enterprise'
    if (tiers.includes('team')) return 'team'
    return 'starter'
  },

  userCount: async ({id: domain}, _args, {authToken, dataLoader}) => {
    const organizations = await getSuggestedTierOrganizations(domain, authToken, dataLoader)
    const orgIds = organizations.map(({id}) => id)
    const organizationUsersByOrgId = (
      await dataLoader.get('organizationUsersByOrgId').loadMany(orgIds)
    ).filter(errorFilter)
    const organizationUsers = organizationUsersByOrgId.flat()
    const userIds = organizationUsers.map((organizationUser) => organizationUser.userId)
    const uniqueUserIds = new Set(userIds)
    return uniqueUserIds.size
  }
}

export default Company
