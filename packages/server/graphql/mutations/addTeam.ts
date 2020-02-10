import {GraphQLNonNull} from 'graphql'
import createTeamAndLeader from './helpers/createTeamAndLeader'
import AddTeamPayload from '../types/AddTeamPayload'
import NewTeamInput from '../types/NewTeamInput'
import {getUserId, isUserInOrg} from '../../utils/authorization'
import publish from '../../utils/publish'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import shortid from 'shortid'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import addTeamValidation from './helpers/addTeamValidation'
import rateLimit from '../rateLimit'
import getRethink from '../../database/rethinkDriver'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import standardError from '../../utils/standardError'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {TierEnum, SuggestedActionTypeEnum} from 'parabol-client/types/graphql'
import encodeAuthToken from '../../utils/encodeAuthToken'
import AuthToken from '../../database/types/AuthToken'

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
    async (_source, args, {authToken, dataLoader, socketId: mutatorId}) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}
      const r = await getRethink()

      // AUTH
      const {orgId} = args.newTeam
      const viewerId = getUserId(authToken)
      if (!(await isUserInOrg(viewerId, orgId))) {
        return standardError(new Error('Organization not found'), {userId: viewerId})
      }

      // VALIDATION
      const orgTeams = await r
        .table('Team')
        .getAll(orgId, {index: 'orgId'})
        .filter((team) =>
          team('isArchived')
            .default(false)
            .ne(true)
        )
        .run()

      const orgTeamNames = orgTeams.map((team) => team.name)
      const {
        data: {newTeam},
        errors
      } = addTeamValidation(orgTeamNames)(args)
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
        if (tier === TierEnum.personal) {
          return standardError(new Error('Max free teams reached'), {userId: viewerId})
        }
      }

      // RESOLUTION
      const teamId = shortid.generate()
      await createTeamAndLeader(viewerId, {id: teamId, isOnboardTeam: false, ...newTeam})

      const {tms} = authToken
      // MUTATIVE
      tms.push(teamId)
      sendSegmentEvent('New Team', viewerId, {orgId, teamId}).catch()
      publish(SubscriptionChannel.NOTIFICATION, viewerId, 'AuthTokenPayload', {tms})
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const data = {
        orgId,
        teamId,
        teamMemberId
      }

      const removedSuggestedActionId = await removeSuggestedAction(
        viewerId,
        SuggestedActionTypeEnum.createNewTeam
      )
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
        authToken: encodeAuthToken(new AuthToken({tms, sub: viewerId}))
      }
    }
  )
}
