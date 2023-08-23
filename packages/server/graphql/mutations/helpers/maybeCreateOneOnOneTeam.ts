import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import generateUID from '../../../generateUID'
import createTeamAndLeader from './createTeamAndLeader'
import IUser from '../../../postgres/types/IUser'
import inviteToTeamHelper from './inviteToTeamHelper'
import {GQLContext} from '../../graphql'
import publish from '../../../utils/publish'
import {SubscriptionChannel} from '~/types/constEnums'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import {getExistingOneOnOneTeam} from './getExistingOneOnOneTeam'

type OneOnOneTeam = {
  email: string
  orgId: string
}

const createNewTeamAndInvite = async (
  viewer: IUser,
  name: string,
  orgId: string,
  invitees: string[],
  context: GQLContext
) => {
  const {authToken, socketId: mutatorId, dataLoader} = context
  const {id: viewerId} = viewer
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const teamId = generateUID()
  await createTeamAndLeader(viewer, {id: teamId, isOnboardTeam: false, name, orgId})

  const {tms} = authToken
  // MUTATIVE
  tms.push(teamId)
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})

  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamData = {
    orgId,
    teamId,
    teamMemberId
  }
  publish(SubscriptionChannel.TEAM, viewerId, 'AddTeamPayload', teamData, subOptions)

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
