import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../../database/rethinkDriver'
import {getUserId, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateOrg: MutationResolvers['updateOrg'] = async (
  _source,
  {updatedOrg},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const {id: orgId, name} = updatedOrg
  if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
    return standardError(new Error('Not organization lead'), {userId: viewerId})
  }

  // VALIDATION
  if (!name) {
    return {error: {message: 'Must provide a name'}}
  }

  const normalizedName = name.trim()
  if (normalizedName.length < 2) {
    return {error: {message: 'The “A Team” had a longer name than that'}}
  }
  if (normalizedName.length > 50) {
    return {error: {message: 'That isn’t very memorable. Maybe shorten it up?'}}
  }

  // RESOLUTION
  const dbUpdate = {
    id: orgId,
    name: normalizedName,
    updatedAt: now
  }
  await r.table('Organization').get(orgId).update(dbUpdate).run()

  const data = {orgId}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateOrgPayload', data, subOptions)
  return data
}

export default updateOrg
