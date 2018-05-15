import {GraphQLID, GraphQLNonNull} from 'graphql'
import {fromGlobalId} from 'graphql-relay'
import getRethink from 'server/database/rethinkDriver'
import JoinIntegrationPayload from 'server/graphql/types/JoinIntegrationPayload'
import maybeJoinRepos from 'server/safeMutations/maybeJoinRepos'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import getPubSub from 'server/utils/getPubSub'
import {GITHUB} from 'universal/utils/constants'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {
  sendIntegrationNotFoundError,
  sendTeamMemberNotFoundError
} from 'server/utils/docNotFoundErrors'
import {sendAlreadyJoinedIntegrationError} from 'server/utils/alreadyMutatedErrors'
import sendAuthRaven from 'server/utils/sendAuthRaven'

export default {
  type: new GraphQLNonNull(JoinIntegrationPayload),
  description: 'Add a user to an integration',
  args: {
    globalId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The global id of the integration to join'
    }
  },
  async resolve (source, {globalId}, {authToken, socketId: mutatorId}) {
    const r = getRethink()

    // AUTH
    const userId = getUserId(authToken)
    const {id: localId, type: service} = fromGlobalId(globalId)
    const integration = await r.table(service).get(localId)
    if (!integration) {
      return sendIntegrationNotFoundError(authToken, localId)
    }
    const {teamId, userIds} = integration
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    // VALIDATION
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    if (userIds.includes(userId)) {
      return sendAlreadyJoinedIntegrationError(authToken, globalId)
    }

    const provider = await r
      .table('Provider')
      .getAll(teamId, {index: 'teamId'})
      .filter({service, userId, isActive: true})
      .nth(0)
      .default(null)
    if (!provider) {
      const breadcrumb = {
        message: 'You must first connect your account to the integration',
        category: 'Join Integration',
        data: {service, teamId}
      }
      return sendAuthRaven(authToken, 'Oh no', breadcrumb)
    }

    // RESOLUTION
    // note: does not fail if they are already a member
    if (service === GITHUB) {
      const usersAndIntegrations = await maybeJoinRepos([integration], [provider])
      const integrationIds = usersAndIntegrations[userId]
      if (integrationIds.length === 0) {
        const breadcrumb = {
          message: 'You must be an org member or collaborator to join',
          category: 'Join Integration',
          data: {service, teamId}
        }
        return sendAuthRaven(authToken, 'Oh no', breadcrumb)
      }
    }

    const teamMemberId = `${userId}::${teamId}`
    const teamMember = await r.table('TeamMember').get(teamMemberId)
    if (!teamMember) {
      return sendTeamMemberNotFoundError(authToken, teamId, userId)
    }

    const integrationJoined = {
      globalId,
      teamMember
    }

    getPubSub().publish(`integrationJoined.${teamId}.${service}`, {
      integrationJoined,
      mutatorId
    })
    return integrationJoined
  }
}
