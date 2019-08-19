import {GraphQLNonNull, GraphQLString} from 'graphql'
import addOrgValidation from './helpers/addOrgValidation'
import createNewOrg from './helpers/createNewOrg'
import createTeamAndLeader from './helpers/createTeamAndLeader'
import AddOrgPayload from '../types/AddOrgPayload'
import NewTeamInput from '../types/NewTeamInput'
import {auth0ManagementClient} from '../../utils/auth0Helpers'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import sendSegmentEvent from '../../utils/sendSegmentEvent'
import shortid from 'shortid'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import rateLimit from '../rateLimit'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import AuthTokenPayload from '../types/AuthTokenPayload'

export default {
  type: AddOrgPayload,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object with exactly 1 team member'
    },
    orgName: {
      type: GraphQLString,
      description: 'The name of the new team'
    }
  },
  resolve: rateLimit({perMinute: 2, perHour: 8})(
    async (_source, args, {authToken, dataLoader, socketId: mutatorId}) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}

      // AUTH
      const viewerId = getUserId(authToken)

      // VALIDATION
      const {
        data: {newTeam, orgName},
        errors
      } = addOrgValidation()(args)
      if (Object.keys(errors).length) {
        return standardError(new Error('Failed input validation'), {userId: viewerId})
      }

      // RESOLUTION
      const orgId = shortid.generate()
      const teamId = shortid.generate()
      await createNewOrg(orgId, orgName, viewerId)
      await createTeamAndLeader(viewerId, {id: teamId, orgId, isOnboardTeam: false, ...newTeam})

      const tms = authToken.tms.concat(teamId)
      sendSegmentEvent('New Org', viewerId, {orgId, teamId}).catch()
      publish(SubscriptionChannel.NOTIFICATION, viewerId, AuthTokenPayload, {tms})
      auth0ManagementClient.users.updateAppMetadata({id: viewerId}, {tms})

      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const data = {
        orgId,
        teamId,
        teamMemberId
      }

      const removedSuggestedActionId = await removeSuggestedAction(viewerId, 'createNewTeam')
      if (removedSuggestedActionId) {
        publish(SubscriptionChannel.NOTIFICATION, viewerId, AddOrgPayload, {removedSuggestedActionId}, subOptions)
      }
      publish(SubscriptionChannel.ORGANIZATION, viewerId, AddOrgPayload, data, subOptions)

      return data
    }
  )
}
