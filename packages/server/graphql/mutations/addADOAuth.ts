import {GraphQLNonNull, GraphQLID} from 'graphql'
// import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import publish from '../../utils/publish'
import AddADOAuthPayload from '../types/AddADOAuthPayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {GQLContext, GQLMutation} from '../graphql'
import {isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import segmentIo from '../../utils/segmentIo'

const addADOAuth: GQLMutation = {
  name: 'AddADOAuth',
  type: GraphQLNonNull(AddADOAuthPayload),
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
    // Make request to /token endpoint to retrieve auth+refresh tokens for ADO

    // Get tenants/orgs the user has access to

    // Get ADO info about user (such as AccountID)

    // if there are the same ADO integrations existing we need to update them with new credentials as well
    // if there's an existing integration for a given user and team (user used an option to refresh the token), skip it as
    // we'll create a new ADO auth object for it for the upsert
    // Decide which ADO authorizations to update

    // Upsert new auth info into database

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
    publish(SubscriptionChannel.TEAM, teamId, 'AddADOAuthSuccess', data, subOptions)
    return data
  }
}

export default addADOAuth
