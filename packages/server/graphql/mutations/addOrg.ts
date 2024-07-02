import {GraphQLList, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import AuthToken from '../../database/types/AuthToken'
import generateUID from '../../generateUID'
import removeSuggestedAction from '../../safeMutations/removeSuggestedAction'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId} from '../../utils/authorization'
import encodeAuthToken from '../../utils/encodeAuthToken'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import rateLimit from '../rateLimit'
import AddOrgPayload from '../types/AddOrgPayload'
import GraphQLEmailType from '../types/GraphQLEmailType'
import NewTeamInput from '../types/NewTeamInput'
import addOrgValidation from './helpers/addOrgValidation'
import createNewOrg from './helpers/createNewOrg'
import createTeamAndLeader from './helpers/createTeamAndLeader'
import inviteToTeamHelper from './helpers/inviteToTeamHelper'

export default {
  type: new GraphQLNonNull(AddOrgPayload),
  description: 'Create a new team and add the first team member',
  args: {
    newTeam: {
      type: new GraphQLNonNull(NewTeamInput),
      description: 'The new team object with exactly 1 team member'
    },
    orgName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the new team'
    },
    invitees: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLEmailType)),
      description: 'The emails of the users to invite to the new org'
    }
  },
  resolve: rateLimit({perMinute: 2, perHour: 8})(async (_source: unknown, args, context) => {
    const {invitees} = args
    const {authToken, dataLoader, socketId: mutatorId} = context
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)

    // VALIDATION
    const {
      data: {newTeam, orgName},
      errors
    } = addOrgValidation()(args) as any
    if (Object.keys(errors).length) {
      return standardError(new Error('Failed input validation'), {userId: viewerId})
    }
    const viewer = await dataLoader.get('users').load(viewerId)
    if (!viewer) {
      return standardError(new Error('Authorization error'), {userId: viewerId})
    }

    // RESOLUTION
    const orgId = generateUID()
    const teamId = generateUID()
    const {email} = viewer
    await createNewOrg(orgId, orgName, viewerId, email, dataLoader)
    await createTeamAndLeader(
      viewer,
      {id: teamId, orgId, isOnboardTeam: false, ...newTeam},
      dataLoader
    )

    const {tms} = authToken
    // MUTATIVE
    tms.push(teamId)
    analytics.newOrg(viewer, orgId, teamId, false)
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
        'AddOrgPayload',
        {removedSuggestedActionId},
        subOptions
      )
    }
    publish(SubscriptionChannel.ORGANIZATION, viewerId, 'AddOrgPayload', data, subOptions)

    if (invitees?.length) {
      await inviteToTeamHelper(invitees, teamId, undefined, context)
    }

    return {
      ...data,
      authToken: encodeAuthToken(new AuthToken({tms, sub: viewerId, rol: authToken.rol}))
    }
  })
}
