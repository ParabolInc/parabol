import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import generateUID from '../../../generateUID'
import removeSuggestedAction from '../../../safeMutations/removeSuggestedAction'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isUserInOrg} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import addTeamValidation from '../../mutations/helpers/addTeamValidation'
import createTeamAndLeader from '../../mutations/helpers/createTeamAndLeader'
import inviteToTeamHelper from '../../mutations/helpers/inviteToTeamHelper'
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
    return standardError(new Error('Organization not found'), {
      userId: viewerId
    })
  }

  // VALIDATION
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
    if (errors.newTeam && errors.newTeam.name) {
      return {
        error: {
          message: errors.newTeam.name
        }
      }
    }
    return standardError(new Error('Failed input validation'), {
      userId: viewerId
    })
  }
  if (orgTeams.length >= Threshold.MAX_FREE_TEAMS) {
    const organization = await dataLoader.get('organizations').loadNonNull(orgId)
    if (getFeatureTier(organization) === 'starter') {
      return standardError(new Error('Max free teams reached'), {
        userId: viewerId
      })
    }
  }
  if (organization.lockedAt) {
    return standardError(new Error('Organization is locked'), {
      userId: viewerId
    })
  }

  // RESOLUTION
  const teamId = generateUID()
  await createTeamAndLeader(viewer, {id: teamId, isOnboardTeam: false, ...newTeam}, dataLoader)

  const {tms} = authToken
  // MUTATIVE
  tms.push(teamId)
  analytics.newTeam(viewer, orgId, teamId, orgTeams.length + 1)
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

  if (invitees?.length) {
    await inviteToTeamHelper(invitees, teamId, undefined, context)
  }

  return data
}

export default addTeam
