import getRethink from '../../../../database/rethinkDriver'
import {RValue} from '../../../../database/stricterR'
import TeamMember from '../../../../database/types/TeamMember'
import {DataLoaderWorker} from '../../../graphql'
import isValid from '../../../isValid'
import {InputMaybe} from '../../resolverTypes'
import {getTeamsByOrgIds} from './getTeamsByOrgIds'

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30

const getActiveTeamCountByOrgIds = async (
  orgIds: string | string[],
  dataLoader: DataLoaderWorker,
  after?: InputMaybe<Date>
) => {
  // teams with at least 2 team members who have logged in within the last 30 days & within an active organization that has had a meeting that has an max(createdAt, endedAt) newer than 30 days ago
  const metAfter = after ? new Date(after) : new Date(Date.now() - THIRTY_DAYS)
  const organizationIds = Array.isArray(orgIds) ? orgIds : [orgIds]
  const unarchivedTeams = await getTeamsByOrgIds(organizationIds, dataLoader, false)
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
}

export default getActiveTeamCountByOrgIds
