import {GraphQLID, GraphQLNonNull} from 'graphql'
import UpdateCreditCardPayload from '../types/UpdateCreditCardPayload'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import {ORGANIZATION, TEAM} from '../../../client/utils/constants'
import standardError from '../../utils/standardError'
import upgradeToPro from './helpers/upgradeToPro'
import {GQLContext} from '../graphql'

export default {
  type: UpdateCreditCardPayload,
  description: 'Update an existing credit card on file',
  args: {
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the org requesting the changed billing'
    },
    stripeToken: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The token that came back from stripe'
    }
  },
  async resolve (
    _source,
    {orgId, stripeToken},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      return standardError(new Error('Must be the organization leader'), {userId: viewerId})
    }

    // RESOLUTION
    await upgradeToPro(orgId, stripeToken)
    const teams = await dataLoader.get('teamsByOrgId').load(orgId)
    const teamIds = teams.map(({id}) => id)
    const data = {teamIds, orgId}

    teamIds.forEach((teamId) => {
      publish(TEAM, teamId, UpdateCreditCardPayload, data, subOptions)
    })

    publish(ORGANIZATION, orgId, UpdateCreditCardPayload, data, subOptions)

    return data
  }
}
