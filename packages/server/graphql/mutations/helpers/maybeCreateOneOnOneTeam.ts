import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import getKysely from '../../../postgres/getKysely'
import generateUID from '../../../generateUID'
import createTeamAndLeader from './createTeamAndLeader'
import IUser from '../../../postgres/types/IUser'
import inviteToTeamHelper from './inviteToTeamHelper'
import {GQLContext} from '../../graphql'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import publish from '../../../utils/publish'
import {SubscriptionChannel} from '~/types/constEnums'

type OneOnOneTeam = {
  userId: string | null
  email: string | null
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

const getExistingExactOneOnOneTeam = async (
  userId: string,
  secondUserId: string,
  orgId: string
) => {
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
  await createTeamAndLeader(viewer!, {id: teamId, isOnboardTeam: false, name, orgId})

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

const maybeCreteOneOnOneTeamFromEmail = async (
  viewer: IUser,
  email: string,
  orgId: string,
  context: GQLContext
) => {
  const teamName = generateOneOnOneTeamName(viewer.preferredName, email.split('@')[0]!)

  const existingUsers = await getUsersByEmails([email])
  const existingUser = existingUsers[0]

  if (!existingUser) {
    return createNewTeamAndInvite(viewer, teamName, orgId, [email], context)
  }

  // If user exists, check if the team with that user already exists
  const existingTeam = await getExistingExactOneOnOneTeam(existingUser.id, viewer.id, orgId)
  if (existingTeam) {
    return existingTeam.id
  }

  return createNewTeamAndInvite(viewer, teamName, orgId, [existingUser.email], context)
}

const maybeCreateOneOnOneTeamFromUserId = async (
  viewer: IUser,
  userId: string,
  orgId: string,
  context: GQLContext
) => {
  const existingTeam = await getExistingExactOneOnOneTeam(userId, viewer.id, orgId)

  if (existingTeam) {
    return existingTeam.id
  }

  const user = await getUserById(userId)
  if (!user) {
    throw new Error('Invited user not found')
  }
  const teamName = generateOneOnOneTeamName(viewer.preferredName, user.preferredName)

  return createNewTeamAndInvite(viewer, teamName, orgId, [user.email], context)
}

export default async function maybeCreateOneOnOneTeam(
  viewer: IUser,
  oneOnOneTeam: OneOnOneTeam,
  context: GQLContext
) {
  const {email, userId, orgId} = oneOnOneTeam

  if (email) {
    return maybeCreteOneOnOneTeamFromEmail(viewer, email, orgId, context)
  } else if (userId) {
    return maybeCreateOneOnOneTeamFromUserId(viewer, userId, orgId, context)
  } else {
    throw new Error('email or userId must be provide for one-on-one team')
  }
}
