import {GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import AuthToken from '../../database/types/AuthToken'
import generateUID from '../../generateUID'
import getTeamsByOrgIds from '../../postgres/queries/getTeamsByOrgIds'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {getUserId, isUserInOrg} from '../../utils/authorization'
import encodeAuthToken from '../../utils/encodeAuthToken'
import publish from '../../utils/publish'
import segmentIo from '../../utils/segmentIo'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import rateLimit from '../rateLimit'
import AddTeamPayload from '../types/AddTeamPayload'
import NewTeamInput, {NewTeamInputType} from '../types/NewTeamInput'
import addTeamValidation from './helpers/addTeamValidation'
import createTeamAndLeader from './helpers/createTeamAndLeader'

export default {
  type: new GraphQLNonNull(AddTeamPayload),
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object'
    }
  },
  resolve: rateLimit({perMinute: 4, perHour: 20})(
    async (
      _source: unknown,
      args: {newTeam: NewTeamInputType},
      {authToken, dataLoader, socketId: mutatorId}: GQLContext
    ) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}

      // AUTH
      const orgId = args.newTeam.orgId ?? ''
      const viewerId = getUserId(authToken)
      const viewer = await dataLoader.get('users').load(viewerId)

      if (!(await isUserInOrg(viewerId, orgId, dataLoader))) {
        return standardError(new Error('Organization not found'), {userId: viewerId})
      }

      // VALIDATION
      const [orgTeams, organization] = await Promise.all([
        getTeamsByOrgIds([orgId], {isArchived: false}),
        dataLoader.get('organizations').load(orgId)
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
        return standardError(new Error('Failed input validation'), {userId: viewerId})
      }
      if (orgTeams.length >= Threshold.MAX_FREE_TEAMS) {
        const organization = await dataLoader.get('organizations').load(orgId)
        const {tier} = organization
        if (tier === 'starter') {
          return standardError(new Error('Max free teams reached'), {userId: viewerId})
        }
      }
      if (organization.lockedAt) {
        return standardError(new Error('Organization is locked'), {userId: viewerId})
      }

      // RESOLUTION
      const teamId = generateUID()
      await createTeamAndLeader(viewer!, {id: teamId, isOnboardTeam: false, ...newTeam})

      const {tms} = authToken
      // MUTATIVE
      tms.push(teamId)
      segmentIo.track({
        userId: viewerId,
        event: 'New Team',
        properties: {
          orgId,
          teamId,
          teamNumber: orgTeams.length + 1
        }
      })
      publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const data = {
        orgId,
        teamId,
        teamMemberId
      }

      const removedSuggestedActionId = await removeSuggestedAction(viewerId, 'createNewTeam')
      if (removedSuggestedActionId) {
        publish(
          SubscriptionChannel.NOTIFICATION,
          viewerId,
          'AddTeamPayload',
          {removedSuggestedActionId},
          subOptions
        )
      }
      publish(SubscriptionChannel.TEAM, viewerId, 'AddTeamPayload', data, subOptions)

      return {
        ...data,
        authToken: encodeAuthToken(new AuthToken({tms, sub: viewerId, rol: authToken.rol}))
      }
    }
  )
}
