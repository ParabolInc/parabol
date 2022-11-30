import getRethink from '../../../database/rethinkDriver'
import {RDatum, RValue} from '../../../database/stricterR'
import TeamMember from '../../../database/types/TeamMember'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import errorFilter from '../../errorFilter'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import {CompanyResolvers} from '../resolverTypes'
export type CompanySource = {id: string}

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

const getTeamsByOrgIds = async (
  orgIds: string[],
  dataLoader: DataLoaderWorker,
  includeArchived: boolean
) => {
  const teamsByOrgId = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(errorFilter)
  const teams = teamsByOrgId.flat()
  return includeArchived ? teams : teams.filter(({isArchived}) => !isArchived)
}

const Company: CompanyResolvers = {
  activeTeamCount: async ({id: domain}, {after}, {dataLoader}) => {
    // teams with at least 2 team members who have logged in within the last 30 days & within an active organization that has had a meeting that has an max(createdAt, endedAt) newer than 30 days ago
    const metAfter = after ? new Date(after) : new Date(Date.now() - THIRTY_DAYS)
    // get the organizations
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
    // get unarchivedTeams
    const orgIds = organizations.map(({id}) => id)
    const unarchivedTeams = await getTeamsByOrgIds(orgIds, dataLoader, false)
    // for each team, get the team members
    const teamIds = unarchivedTeams.map(({id}) => id)
    const teamMembers = (await dataLoader.get('teamMembersByTeamId').loadMany(teamIds))
      .filter(isValid)
      .flat()
    // for each team member, get the user
    const userIds = [...new Set(teamMembers.map(({userId}) => userId))]
    const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
    // join the user to the team member
    const activeTeamMembers = teamMembers.filter((teamMember) => {
      // coercion on purpose. if this throws an error, our data model is bad & we want to know about it
      return !users.find((user) => user.id === teamMember.userId)!.inactive
    })
    // group team members by teamId
    const teamMembersByTeamId = activeTeamMembers.reduce((obj, teamMember) => {
      if (obj[teamMember.teamId]) {
        obj[teamMember.teamId]!.push(teamMember)
      } else {
        obj[teamMember.teamId] = [teamMember]
      }
      return obj
    }, {} as Record<string, [TeamMember, ...TeamMember[]]>)
    // filter to teams with at least 2 teamMembers where !teamMember.user.inactive
    const teamsWithSufficientTeamMembers = Object.values(teamMembersByTeamId)
      .map((teamMembers) => {
        return {
          count: teamMembers.length,
          team: unarchivedTeams.find((team) => team.id === teamMembers[0].teamId)!
        }
      })
      .filter((agg) => agg.count >= 2)
      .map((agg) => agg.team)
    // for each filtered team, find a meeting with a lastMetAt newer than metAfter (default 30 days)
    const r = await getRethink()
    const lastMetAt = (await Promise.all(
      teamsWithSufficientTeamMembers.map((team) => {
        return r
          .table('NewMeeting')
          .getAll(team.id, {index: 'teamId'})
          .merge((meeting: RValue) => ({
            lastMetAt: meeting('endedAt').default(meeting('createdAt'))
          }))
          .filter((meeting: RValue) => meeting('lastMetAt').ge(metAfter))
          .limit(1)
          .nth(0)('lastMetAt')
          .default(null)
      })
    )) as unknown as (Date | null)[]

    // filter out teams without a meeting that has been updated within the last 30 days
    const recentlyMetTeams = teamsWithSufficientTeamMembers.filter((_team, idx) => !!lastMetAt[idx])

    // return length of filtered teams
    return recentlyMetTeams.length
  },

  activeUserCount: async ({id: domain}, {after}, {dataLoader}) => {
    // number of users on an active organization that has logged in within the last 30 days
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
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
  activeOrganizationCount: async ({id: domain}, _args, {dataLoader}) => {
    // organizations with at least 1 unarchived team on it, which has at least 2 team members who have logged in within the last 30 days

    // get the organizations
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
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
    const unarchivedTeams = await getTeamsByOrgIds(allOrgIds, dataLoader, false)
    // if there aren't any unarchived teams, abort
    if (unarchivedTeams.length === 0) return 0
    // create teamMemberIds
    const teamIds = unarchivedTeams.map(({id}) => id)
    // get the teamMembers by teamId, userId
    const teamMembers = (await dataLoader.get('teamMembersByTeamId').loadMany(teamIds))
      .flat()
      .filter(isValid)
    // group by teamId
    const teamMembersByTeamId = teamMembers.reduce((obj, teamMember) => {
      if (obj[teamMember.teamId]) {
        obj[teamMember.teamId]!.push(teamMember)
      } else {
        obj[teamMember.teamId] = [teamMember]
      }
      return obj
    }, {} as Record<string, [TeamMember, ...TeamMember[]]>)

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
  lastMetAt: async ({id: domain}, _args, {dataLoader}) => {
    const r = await getRethink()
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
    const orgIds = organizations.map(({id}) => id)
    const teams = await getTeamsByOrgIds(orgIds, dataLoader, true)
    const teamIds = teams.map(({id}) => id)
    if (teamIds.length === 0) return 0
    const lastMetAt = await r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .max('createdAt' as any)('createdAt')
      .default(null)
      .run()
    return lastMetAt
  },

  meetingCount: async ({id: domain}, {after}, {dataLoader}) => {
    // number of meetings created by teams on organizations assigned to the domain
    const r = await getRethink()
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
    const orgIds = organizations.map(({id}) => id)
    const teams = await getTeamsByOrgIds(orgIds, dataLoader, true)
    const teamIds = teams.map(({id}) => id)
    if (teamIds.length === 0) return 0
    const filterFn = after ? () => true : (meeting: any) => meeting('createdAt').ge(after)
    return r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter(filterFn)
      .count()
      .default(0)
      .run()
  },

  monthlyTeamStreakMax: async ({id: domain}, _args, {dataLoader}) => {
    const r = await getRethink()
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
    const orgIds = organizations.map(({id}) => id)
    const teams = await getTeamsByOrgIds(orgIds, dataLoader, true)
    const teamIds = teams.map(({id}) => id)
    if (teamIds.length === 0) return 0
    return (
      r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row: RDatum) => row('endedAt').default(null).ne(null))
        // number of months since unix epoch
        .merge((row: RValue) => ({
          epochMonth: row('endedAt').month().add(row('endedAt').year().mul(12))
        }))
        .group((row) => [row('teamId'), row('epochMonth')])
        .count()
        .ungroup()
        .map((row) => ({
          teamId: row('group')(0),
          epochMonth: row('group')(1)
        }))
        .group('teamId')('epochMonth')
        .ungroup()
        .map((row) => ({
          teamId: row('group'),
          epochMonth: row('reduction'),
          // epochMonth shifted 1 index position
          shift: row('reduction')
            .deleteAt(0)
            .map((z) => z.add(-1))
        }))
        .merge((row: RValue) => ({
          // 1 if there are 2 consecutive epochMonths next to each other, else 0
          teamStreak: r
            .map(row('shift'), row('epochMonth'), (shift, epochMonth) =>
              r.branch(shift.eq(epochMonth), '1', '0')
            )
            .reduce((left, right) => left.add(right).default(''))
            .default('')
            // get an array of all the groupings of 1
            .split('0')
            .map((val) => val.count())
            .max()
            .add(1)
        }))
        .max('teamStreak')('teamStreak')
        .run()
    )
  },

  organizations: async ({id: domain}, _args, {authToken, dataLoader}) => {
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
    // only superusers can see across ALL organizations.
    // users can only see the organizations they are apart of
    if (isSuperUser(authToken)) return organizations
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
    const isViewerAllowedToSeeAll = allOrganizationUsers.some(
      ({suggestedTier}) => suggestedTier === 'enterprise'
    )
    if (isViewerAllowedToSeeAll) return organizations
    // Pro-qualified or unqualified users can only see orgs that they are apart of
    const allowedOrgIds = allOrganizationUsers.map(({orgId}) => orgId)
    return organizations.filter((organization) => allowedOrgIds.includes(organization.id))
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

  userCount: async ({id: domain}, _args, {dataLoader}) => {
    const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
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
