import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {RValue} from '../../database/stricterR'
import {TierEnum as ETierEnum} from '../../database/types/Invoice'
import OrganizationType from '../../database/types/Organization'
import OrganizationUser from '../../database/types/OrganizationUser'
import {Team} from '../../postgres/queries/getTeamsByIds'
import errorFilter from '../errorFilter'
import {GQLContext} from '../graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import Organization from './Organization'
import TierEnum from './TierEnum'

const Company = new GraphQLObjectType<any, GQLContext>({
  name: 'Company',
  description: 'A grouping of organizations. Automatically grouped by top level domain of each',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the top level domain'
    },
    activeTeamCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the number of active teams across all organizations',
      resolve: async ({id: domain}, _args: unknown, {dataLoader}) => {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}: OrganizationType) => id)
        const teamsByOrgId = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(
          errorFilter
        )
        const teams = teamsByOrgId.flat().filter(({isArchived}: Team) => !isArchived)
        const teamIds = teams.map(({id}: Team) => id)

        const AreTeamsActive = await Promise.all(
          teamIds.map(async (teamId) => {
            const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
            if (activeMeetings.length > 0) {
              return true
            } else {
              const completedMeetings = await dataLoader
                .get('completedMeetingsByTeamId')
                .load(teamId)
              const completedMeetingsLast30Days = completedMeetings.filter(
                ({endedAt}) => new Date().getTime() - endedAt!.getTime() < 30 * 24 * 60 * 60 * 1000
              )
              return completedMeetingsLast30Days.length > 0
            }
          })
        )
        return AreTeamsActive.filter(Boolean).length
      }
    },
    activeUserCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the number of active users across all organizations',
      resolve: async ({id: domain}, _args: unknown, {dataLoader}) => {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}: OrganizationType) => id)
        const organizationUsersByOrgId = (
          await dataLoader.get('organizationUsersByOrgId').loadMany(orgIds)
        ).filter(errorFilter)
        const organizationUsers = organizationUsersByOrgId.flat()
        const activeOrganizationUsers = organizationUsers.filter(
          (organizationUser: OrganizationUser) => !organizationUser.inactive
        )
        const userIds = activeOrganizationUsers.map(
          (organizationUser: OrganizationUser) => organizationUser.userId
        )
        const uniqueUserIds = new Set(userIds)
        return uniqueUserIds.size
      }
    },
    lastMetAt: {
      type: GraphQLISO8601Type,
      description:
        'the last time any team in the organization started a meeting, null if no meetings were ever run',
      resolve: async ({id: domain}, _args: unknown, {dataLoader}) => {
        const r = await getRethink()
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}: OrganizationType) => id)
        const teamsByOrgId = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(
          errorFilter
        )
        const teams = teamsByOrgId.flat()
        const teamIds = teams.map(({id}) => id)
        if (teamIds.length === 0) return 0
        const lastMetAt = await r
          .table('NewMeeting')
          .getAll(r.args(teamIds), {index: 'teamId'})
          .max('createdAt' as any)('createdAt')
          .default(null)
          .run()
        return lastMetAt
      }
    },
    meetingCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the total number of meetings started across all teams on all organizations',
      resolve: async ({id: domain}, _args: unknown, {dataLoader}) => {
        const r = await getRethink()
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}: OrganizationType) => id)
        const teamsByOrgId = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(
          errorFilter
        )
        const teams = teamsByOrgId.flat()
        const teamIds = teams.map(({id}) => id)
        if (teamIds.length === 0) return 0
        return r
          .table('NewMeeting')
          .getAll(r.args(teamIds), {index: 'teamId'})
          .count()
          .default(0)
          .run()
      }
    },
    monthlyTeamStreakMax: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'the longest monthly streak for meeting at least once per month for any team in the company',
      resolve: async ({id: domain}, _args: unknown, {dataLoader}) => {
        const r = await getRethink()
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}: OrganizationType) => id)
        const teamsByOrgId = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(
          errorFilter
        )
        const teams = teamsByOrgId.flat()
        const teamIds = teams.map(({id}) => id)
        if (teamIds.length === 0) return 0
        return (
          r
            .table('NewMeeting')
            .getAll(r.args(teamIds), {index: 'teamId'})
            .filter((row) => row('endedAt').default(null).ne(null))
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
      }
    },
    organizations: {
      description: 'Get the list of all organizations that belong to the company',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Organization))),
      async resolve({id: domain}, _args: unknown, {dataLoader}) {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        return organizations
      }
    },
    tier: {
      description: 'The highest tier for any organization within the company',
      type: new GraphQLNonNull(TierEnum),
      async resolve({id: domain}, _args: unknown, {dataLoader}) {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const tiers: ETierEnum[] = organizations.map(({tier}: OrganizationType) => tier)
        if (tiers.includes('enterprise')) return 'enterprise'
        if (tiers.includes('pro')) return 'pro'
        return 'personal'
      }
    },
    userCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the total number of users across all organizations',
      resolve: async ({id: domain}, _args: unknown, {dataLoader}) => {
        const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
        const orgIds = organizations.map(({id}: OrganizationType) => id)
        const organizationUsersByOrgId = (
          await dataLoader.get('organizationUsersByOrgId').loadMany(orgIds)
        ).filter(errorFilter)
        const organizationUsers = organizationUsersByOrgId.flat()
        const userIds = organizationUsers.map(
          (organizationUser: OrganizationUser) => organizationUser.userId
        )
        const uniqueUserIds = new Set(userIds)
        return uniqueUserIds.size
      }
    }
  })
})

export default Company
