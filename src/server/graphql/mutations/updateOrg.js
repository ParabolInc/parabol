import {GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import UpdateOrgInput from 'server/graphql/types/UpdateOrgInput'
import UpdateOrgPayload from 'server/graphql/types/UpdateOrgPayload'
import {getUserId, isUserBillingLeader} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {ORGANIZATION} from 'universal/utils/constants'
import updateOrgValidation from './helpers/updateOrgValidation'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(UpdateOrgPayload),
  description: 'Update an with a change in name, avatar',
  args: {
    updatedOrg: {
      type: new GraphQLNonNull(UpdateOrgInput),
      description: 'the updated org including the id, and at least one other field'
    }
  },
  async resolve(source, {updatedOrg}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
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
    } = schema(updatedOrg)
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

    const data = {orgId}
    publish(ORGANIZATION, orgId, UpdateOrgPayload, data, subOptions)
    return data
  }
}
