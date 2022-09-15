import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {getUserId, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {GQLContext} from '../../graphql'
import {UpdateOrgInputType} from '../../types/UpdateOrgInput'
import updateOrgValidation from '../helpers/updateOrgValidation'

const updateOrg = async (
  _source: unknown,
  {updatedOrg}: {updatedOrg: UpdateOrgInputType},
  {authToken, dataLoader, socketId: mutatorId}: GQLContext
) => {
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
  await r.table('Organization').get(orgId).update(dbUpdate).run()

  const data = {orgId}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateOrgPayload', data, subOptions)
  return data
}

export default updateOrg
