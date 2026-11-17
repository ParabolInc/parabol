import {GraphQLError} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import AuthToken from '../../../database/types/AuthToken'
import generateUID from '../../../generateUID'
import removeSuggestedAction from '../../../safeMutations/removeSuggestedAction'
import {setAuthCookie} from '../../../utils/authCookie'
import {getUserId, isUserInOrg} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import addTeamValidation from '../../mutations/helpers/addTeamValidation'
import createTeamAndLeader from '../../mutations/helpers/createTeamAndLeader'
import {assertInviteeCount, inviteToNewTeam} from '../../mutations/helpers/inviteToTeamHelper'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {MutationResolvers} from '../resolverTypes'

const addTeam: MutationResolvers['addTeam'] = async (_source, args, context) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const {invitees} = args
  const orgId = args.newTeam.orgId ?? ''
  const viewerId = getUserId(authToken)

  if (!(await isUserInOrg(viewerId, orgId, dataLoader))) {
    throw new GraphQLError('Organization not found', {extensions: {code: 'NOT_FOUND'}})
  }

  // VALIDATION
  if (invitees) assertInviteeCount(invitees)
  const [orgTeams, organization, viewer] = await Promise.all([
    dataLoader.get('teamsByOrgIds').load(orgId),
    dataLoader.get('organizations').loadNonNull(orgId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  const orgTeamNames = orgTeams.map((team) => team.name)
  const {
    data: {newTeam},
    errors
  } = addTeamValidation(orgTeamNames)(args) as any
  if (Object.keys(errors).length) {
    const message = errors.newTeam?.name || 'Failed input validation'
    throw new GraphQLError(message, {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (orgTeams.length >= Threshold.MAX_FREE_TEAMS) {
    const organization = await dataLoader.get('organizations').loadNonNull(orgId)
    if (getFeatureTier(organization) === 'starter') {
      throw new GraphQLError('Max free teams reached', {extensions: {code: 'UPGRADE_REQUIRED'}})
    }
  }
  if (organization.lockedAt) {
    throw new GraphQLError('Organization is locked', {extensions: {code: 'FORBIDDEN'}})
  }

  // RESOLUTION
  const teamId = generateUID()
  await createTeamAndLeader(viewer, {id: teamId, isOnboardTeam: false, ...newTeam}, dataLoader)

  const {tms} = authToken
  // MUTATIVE
  tms.push(teamId)
  const nextAuthToken = new AuthToken({
    tms,
    sub: viewerId,
    rol: authToken.rol,
    exp: authToken.exp,
    act: authToken.act,
    aud: authToken.aud,
    scope: authToken.scope
  })
  context.authToken = nextAuthToken
  if (context.request) {
    setAuthCookie(context, nextAuthToken)
  }
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {
    tms
  })

  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const removedSuggestedActionId = await removeSuggestedAction(viewerId, 'createNewTeam')
  const data = {
    orgId,
    teamId,
    teamMemberId,
    removedSuggestedActionId
  }
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AddTeamPayload', data, subOptions)

  const inviteResults = await inviteToNewTeam(invitees, teamId, context)
  return {...data, invitees: inviteResults}
}

export default addTeam
