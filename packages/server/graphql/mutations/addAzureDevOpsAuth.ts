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
    // const r = await getRethink()
    const viewerId = getUserId(authToken)
    // const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    console.log(code, verifier)

    //AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Attempted teamId spoof'), {userId: viewerId})
    }

    // VALIDATION

    // RESOLUTION
    // Make request to /token endpoint to retrieve auth+refresh tokens for AzureDevOps

    // Get tenants/orgs the user has access to

    // Get AzureDevOps info about user (such as AccountID)

    // if there are the same AzureDevOps integrations existing we need to update them with new credentials as well
    // if there's an existing integration for a given user and team (user used an option to refresh the token), skip it as
    // we'll create a new AzureDevOps auth object for it for the upsert
    // Decide which AzureDevOps authorizations to update
    const azureDevOpsAuthsToUpdate = [
      {
        userId: '',
        teamId: '',
        accountId: '',
        accessToken: '',
        refreshToken: '',
        cloudIds: [],
        scope: ''
      }
    ]
    // Upsert new auth info into database
    await upsertAzureDevOpsAuths([
      {
        accountId: '',
        userId: viewerId,
        accessToken: '',
        refreshToken: '',
        cloudIds: [],
        teamId,
        scope: ''
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
