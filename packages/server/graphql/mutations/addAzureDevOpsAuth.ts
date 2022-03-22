import {GraphQLNonNull, GraphQLID} from 'graphql'
// import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import AddAzureDevOpsAuthPayload from '../types/AddAzureDevOpsAuthPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext, GQLMutation} from '../graphql'
import {isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import segmentIo from '../../utils/segmentIo'
import upsertAzureDevOpsAuths from '../../postgres/queries/upsertAzureDevOpsAuths'
import AzureDevOpsServerManager from '../../utils/AzureDevOpsServerManager'
import getAzureDevOpsAuthsByUserId from '../../postgres/queries/getAzureDevOpsAuthsByUserId'

const addAzureDevOpsAuth: GQLMutation = {
  name: 'AddAzureDevOpsAuth',
  type: GraphQLNonNull(AddAzureDevOpsAuthPayload),
  description: ``,
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    verifier: {
      type: new GraphQLNonNull(GraphQLID)
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {code, verifier, teamId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    // const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // RESOLUTION
    // Make request to /token endpoint to retrieve auth+refresh tokens for AzureDevOps
    const oauthResponse = await AzureDevOpsServerManager.init(code, verifier)
    if (oauthResponse instanceof Error) {
      return standardError(oauthResponse, {userId: viewerId})
    }
    const {accessToken, refreshToken, scopes} = oauthResponse
    const manager = new AzureDevOpsServerManager(accessToken)

    // Get AzureDevOps info about user (such as AccountID)
    const self = await manager.getMe()
    if (!('id' in self)) {
      return standardError(new Error(self.message), {userId: viewerId})
    }

    // Get tenants/orgs the user has access to
    const instances = await manager.getAccessibleOrgs(self.id)
    if (!Array.isArray(instances)) {
      return standardError(new Error(instances.message), {userId: viewerId})
    }
    const instanceIds = instances.map((inst) => inst.accountId)

    // if there are the same AzureDevOps integrations existing we need to update them with new credentials as well
    // if there's an existing integration for a given user and team (user used an option to refresh the token), skip it as
    // we'll create a new AzureDevOps auth object for it for the upsert
    // Decide which AzureDevOps authorizations to update
    const userAzureDevOpsAuths = await getAzureDevOpsAuthsByUserId(viewerId)
    const azureDevOpsAuthsToUpdate = userAzureDevOpsAuths
      .filter((auth) => auth.accountId === self.id && auth.teamId !== teamId)
      .map((auth) => ({
        ...auth,
        accessToken,
        refreshToken
      }))

    // Upsert new auth info into database
    await upsertAzureDevOpsAuths([
      {
        accountId: self.id,
        userId: viewerId,
        accessToken,
        refreshToken,
        instanceIds,
        teamId,
        scope: scopes
      },
      ...azureDevOpsAuthsToUpdate
    ])

    // Monitor the success/failure of the mutation
    segmentIo.track({
      userId: viewerId,
      event: 'Added Integration',
      properties: {
        teamId,
        service: 'AzureDevOps'
      }
    })
    const data = {teamId, userId: viewerId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddAzureDevOpsAuthSuccess', data, subOptions)
    return data
  }
}

export default addAzureDevOpsAuth
