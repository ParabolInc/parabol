import {GraphQLNonNull} from 'graphql'
import createTeamAndLeader from 'server/graphql/mutations/helpers/createTeamAndLeader'
import AddTeamPayload from 'server/graphql/types/AddTeamPayload'
import NewTeamInput from 'server/graphql/types/NewTeamInput'
import {auth0ManagementClient} from 'server/utils/auth0Helpers'
import {getUserId, isUserInOrg} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import shortid from 'shortid'
import {NEW_AUTH_TOKEN, NOTIFICATION, PERSONAL, TEAM, UPDATED} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import addTeamValidation from './helpers/addTeamValidation'
import rateLimit from 'server/graphql/rateLimit'
import {MAX_FREE_TEAMS} from 'server/utils/serverConstants'
import getRethink from 'server/database/rethinkDriver'
import removeSuggestedAction from 'server/safeMutations/removeSuggestedAction'
import standardError from 'server/utils/standardError'

export default {
  type: AddTeamPayload,
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object'
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
      if (orgTeams.length >= MAX_FREE_TEAMS) {
        const organization = await dataLoader.get('organizations').load(orgId)
        const {tier} = organization
        if (tier === PERSONAL) {
          return standardError(new Error('Max free teams reached'), {userId: viewerId})
        }
      }

      // RESOLUTION
      const teamId = shortid.generate()
      // FIXME turn isOnboardTeam to false after finished debugging
      await createTeamAndLeader(viewerId, {id: teamId, isOnboardTeam: true, ...newTeam})

      const tms = authToken.tms.concat(teamId)
      sendSegmentEvent('New Team', viewerId, {orgId, teamId})
      publish(NEW_AUTH_TOKEN, viewerId, UPDATED, {tms})
      auth0ManagementClient.users.updateAppMetadata({id: viewerId}, {tms})

      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const data = {
        orgId,
        teamId,
        teamMemberId
      }

      const removedSuggestedActionId = await removeSuggestedAction(viewerId, 'createNewTeam')
      if (removedSuggestedActionId) {
        publish(NOTIFICATION, viewerId, AddTeamPayload, {removedSuggestedActionId}, subOptions)
      }
      publish(TEAM, viewerId, AddTeamPayload, data, subOptions)

      return data
    }
  )
}
