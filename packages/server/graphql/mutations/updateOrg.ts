import {GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import UpdateOrgInput from '../types/UpdateOrgInput'
import UpdateOrgPayload from '../types/UpdateOrgPayload'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import publish from '../../utils/publish'
import updateOrgValidation from './helpers/updateOrgValidation'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  type: new GraphQLNonNull(UpdateOrgPayload),
  description: 'Update an with a change in name, avatar',
  args: {
    updatedOrg: {
      type: new GraphQLNonNull(UpdateOrgInput),
      description: 'the updated org including the id, and at least one other field'
    }
  },
  async resolve(_source, {updatedOrg}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, updatedOrg.id, dataLoader))) {
      return standardError(new Error('Not organization lead'), {userId: viewerId})
    }

    // VALIDATION
    const schema = updateOrgValidation()
    const {
      errors,
      data: {id: orgId, ...org}
    } = schema(updatedOrg) as any
    if (Object.keys(errors).length) {
      return standardError(new Error('Failed input validation'), {userId: viewerId})
    }

    // RESOLUTION
    const dbUpdate = {
      ...org,
      updatedAt: now
    }
    await r
      .table('Organization')
      .get(orgId)
      .update(dbUpdate)
      .run()

    const data = {orgId}
    publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateOrgPayload', data, subOptions)
    return data
  }
}
