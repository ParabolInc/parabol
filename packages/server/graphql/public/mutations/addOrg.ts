import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import generateUID from '../../../generateUID'
import removeSuggestedAction from '../../../safeMutations/removeSuggestedAction'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import addOrgValidation from '../../mutations/helpers/addOrgValidation'
import createNewOrg from '../../mutations/helpers/createNewOrg'
import createTeamAndLeader from '../../mutations/helpers/createTeamAndLeader'
import inviteToTeamHelper from '../../mutations/helpers/inviteToTeamHelper'
import {MutationResolvers} from '../resolverTypes'

const addOrg: MutationResolvers['addOrg'] = async (_source, args, context) => {
  const {invitees} = args
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)

  // VALIDATION
  const {
    data: {newTeam, orgName},
    errors
  } = addOrgValidation()(args) as any
  if (Object.keys(errors).length) {
    return standardError(new Error('Failed input validation'), {
      userId: viewerId
    })
  }
  const viewer = await dataLoader.get('users').load(viewerId)
  if (!viewer) {
    return standardError(new Error('Authorization error'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  const orgId = generateUID()
  const teamId = generateUID()
  const {email} = viewer
  await createNewOrg(orgId, orgName, viewerId, email, dataLoader)
  await createTeamAndLeader(
    viewer,
    {id: teamId, orgId, isOnboardTeam: false, ...newTeam},
    dataLoader
  )

  const {tms} = authToken
  // MUTATIVE
  tms.push(teamId)
  analytics.newOrg(viewer, orgId, teamId, false)
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
  publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AddOrgPayload', data, subOptions)

  if (invitees?.length) {
    await inviteToTeamHelper(invitees, teamId, undefined, context)
  }

  return data
}

export default addOrg
