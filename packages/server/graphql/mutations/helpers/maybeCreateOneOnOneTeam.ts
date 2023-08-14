import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import getKysely from '../../../postgres/getKysely'
import generateUID from '../../../generateUID'
import createTeamAndLeader from './createTeamAndLeader'
import IUser from '../../../postgres/types/IUser'
import inviteToTeamHelper from './inviteToTeamHelper'
import {GQLContext} from '../../graphql'
import publish from '../../../utils/publish'
import {SubscriptionChannel} from '~/types/constEnums'

type OneOnOneTeam = {
  email: string
  orgId: string
}

const getExistingExactTeams = async (userIds: string[], orgId: string) => {
  const r = await getRethink()
  const pg = getKysely()
  const existingTeamIds = await (
    r
      .table('TeamMember')
      // Select teams where both users exists
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({isNotRemoved: true}) // Only consider users who are not removed
      .group('teamId') as RValue
  )
    .count()
    .ungroup()
    .filter(r.row('reduction').eq(userIds.length))
    .without('reduction')
    // Get all team members for each team
    .eqJoin('group', r.table('TeamMember'), {index: 'teamId'})
    .zip()
    .group('teamId')
    .pluck('userId')
    .ungroup()
    // Select only teams with exact given number of team members
    .filter((row: RValue) => {
      return row('reduction').count().eq(userIds.length)
    })
    .getField('group')
    .coerceTo('array')
    .run()

  if (!existingTeamIds.length) {
    return []
  }

  return pg
    .selectFrom('Team')
    .selectAll()
    .where('id', 'in', existingTeamIds)
    .where('orgId', '=', orgId)
    .where('isArchived', '=', false)
    .execute()
}

const getExistingOneOnOneTeam = async (userId: string, secondUserId: string, orgId: string) => {
  const teams = await getExistingExactTeams([userId, secondUserId], orgId)
  return teams[0]
}

const createNewTeamAndInvite = async (
  viewer: IUser,
  name: string,
  orgId: string,
  invitees: string[],
  context: GQLContext
) => {
  const {authToken} = context
  const teamId = generateUID()
  await createTeamAndLeader(viewer, {id: teamId, isOnboardTeam: false, name, orgId})

  const {tms} = authToken
  // MUTATIVE
  tms.push(teamId)
  publish(SubscriptionChannel.NOTIFICATION, viewer.id, 'AuthTokenPayload', {tms})

  await inviteToTeamHelper(invitees, teamId, undefined, context)

  return teamId
}

const generateOneOnOneTeamName = (firstUserName: string, secondUserName: string) => {
  return `${firstUserName} / ${secondUserName}`
}

export default async function maybeCreateOneOnOneTeam(
  viewer: IUser,
  oneOnOneTeam: OneOnOneTeam,
  context: GQLContext
) {
  const {email, orgId} = oneOnOneTeam

  const existingUser = await getUserByEmail(email)

  if (!existingUser) {
    const teamName = generateOneOnOneTeamName(viewer.preferredName, email.split('@')[0]!)
    return createNewTeamAndInvite(viewer, teamName, orgId, [email], context)
  }

  // If user exists, check if the team with that user already exists
  const existingTeam = await getExistingOneOnOneTeam(existingUser.id, viewer.id, orgId)
  if (existingTeam) {
    return existingTeam.id
  }

  const teamName = generateOneOnOneTeamName(viewer.preferredName, existingUser.preferredName)
  return createNewTeamAndInvite(viewer, teamName, orgId, [existingUser.email], context)
}
