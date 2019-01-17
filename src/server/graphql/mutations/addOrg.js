import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import addOrgValidation from 'server/graphql/mutations/helpers/addOrgValidation'
import addTeamInvitees from 'server/graphql/mutations/helpers/addTeamInvitees'
import createNewOrg from 'server/graphql/mutations/helpers/createNewOrg'
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader'
import AddOrgPayload from 'server/graphql/types/AddOrgPayload'
import Invitee from 'server/graphql/types/Invitee'
import NewTeamInput from 'server/graphql/types/NewTeamInput'
import {auth0ManagementClient} from 'server/utils/auth0Helpers'
import {getUserId} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import shortid from 'shortid'
import {NEW_AUTH_TOKEN, NOTIFICATION, ORGANIZATION, UPDATED} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import sendFailedInputValidation from 'server/utils/sendFailedInputValidation'
import rateLimit from 'server/graphql/rateLimit'

export default {
  type: AddOrgPayload,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object with exactly 1 team member'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(Invitee))
    },
    orgName: {
      type: GraphQLString,
      description: 'The name of the new team'
    }
  },
  resolve: rateLimit({perMinute: 2, perHour: 8})(
    async (source, args, {authToken, dataLoader, socketId: mutatorId}) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}

      // AUTH
      const viewerId = getUserId(authToken)

      // VALIDATION
      const {
        data: {invitees, newTeam, orgName},
        errors
      } = addOrgValidation()(args)
      if (Object.keys(errors).length) {
        return sendFailedInputValidation(authToken, errors)
      }

      // RESOLUTION
      const orgId = shortid.generate()
      const teamId = shortid.generate()
      await createNewOrg(orgId, orgName, viewerId)
      await createTeamAndLeader(viewerId, {id: teamId, orgId, isOnboardTeam: false, ...newTeam})

      const tms = authToken.tms.concat(teamId)
      const inviteeCount = invitees ? invitees.length : 0
      sendSegmentEvent('New Org', viewerId, {orgId, teamId, inviteeCount})
      publish(NEW_AUTH_TOKEN, viewerId, UPDATED, {tms})
      auth0ManagementClient.users.updateAppMetadata({id: viewerId}, {tms})

      const {invitationIds, teamInviteNotifications} = await addTeamInvitees(
        invitees,
        teamId,
        viewerId,
        dataLoader
      )
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const data = {
        orgId,
        teamId,
        teamMemberId,
        invitationIds,
        teamInviteNotifications
      }
      teamInviteNotifications.forEach((notification) => {
        const {
          userIds: [inviteeUserId]
        } = notification
        publish(NOTIFICATION, inviteeUserId, AddOrgPayload, data, subOptions)
      })
      publish(ORGANIZATION, viewerId, AddOrgPayload, data, subOptions)

      return data
    }
  )
}
