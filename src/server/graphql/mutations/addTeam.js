import {GraphQLList, GraphQLNonNull} from 'graphql'
import addTeamInvitees from 'server/graphql/mutations/helpers/addTeamInvitees'
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader'
import AddTeamPayload from 'server/graphql/types/AddTeamPayload'
import Invitee from 'server/graphql/types/Invitee'
import NewTeamInput from 'server/graphql/types/NewTeamInput'
import {auth0ManagementClient} from 'server/utils/auth0Helpers'
import {getUserId, isUserInOrg} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import shortid from 'shortid'
import {NEW_AUTH_TOKEN, NOTIFICATION, PERSONAL, TEAM, UPDATED} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import addTeamValidation from './helpers/addTeamValidation'
import {sendMaxFreeTeamsError, sendOrgAccessError} from 'server/utils/authorizationErrors'
import sendFailedInputValidation from 'server/utils/sendFailedInputValidation'
import rateLimit from 'server/graphql/rateLimit'
import {MAX_FREE_TEAMS} from 'server/utils/serverConstants'
import getRethink from 'server/database/rethinkDriver'

export default {
  type: AddTeamPayload,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(Invitee))
    }
  },
  resolve: rateLimit({perMinute: 4, perHour: 20})(
    async (source, args, {authToken, dataLoader, socketId: mutatorId}) => {
      const operationId = dataLoader.share()
      const subOptions = {mutatorId, operationId}
      const r = getRethink()

      // AUTH
      const {orgId} = args.newTeam
      const viewerId = getUserId(authToken)
      if (!(await isUserInOrg(viewerId, orgId))) {
        sendOrgAccessError(authToken, orgId)
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

      const orgTeamNames = orgTeams.map((team) => team.name)
      const {
        data: {invitees, newTeam},
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
        return sendFailedInputValidation(authToken, errors)
      }
      if (orgTeams.length >= MAX_FREE_TEAMS) {
        const organization = await dataLoader.get('organizations').load(orgId)
        const {tier} = organization
        if (tier === PERSONAL) {
          return sendMaxFreeTeamsError(authToken, orgId)
        }
      }

      // RESOLUTION
      const teamId = shortid.generate()
      await createTeamAndLeader(viewerId, {id: teamId, ...newTeam}, {isNewOrg: false})

      const tms = authToken.tms.concat(teamId)
      const inviteeCount = invitees ? invitees.length : 0
      sendSegmentEvent('New Team', viewerId, {orgId, teamId, inviteeCount})
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
          userIds: [invitedUserId]
        } = notification
        publish(NOTIFICATION, invitedUserId, AddTeamPayload, data, subOptions)
      })
      publish(TEAM, viewerId, AddTeamPayload, data, subOptions)

      return data
    }
  )
}
