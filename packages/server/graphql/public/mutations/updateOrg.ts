import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const updateOrg: MutationResolvers['updateOrg'] = async (
  _source,
  {updatedOrg},
  {socketId: mutatorId, dataLoader}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const {id: orgId, name} = updatedOrg

  // VALIDATION
  if (!name) {
    return {error: {message: 'Must provide a name'}}
  }

  const normalizedName = name.trim()
  if (normalizedName.length < 2) {
    return {error: {message: 'The “A Team” had a longer name than that'}}
  }
  if (normalizedName.length > 50) {
    return {
      error: {message: 'That isn’t very memorable. Maybe shorten it up?'}
    }
  }

  // RESOLUTION
  await getKysely()
    .updateTable('Organization')
    .set({name: normalizedName})
    .where('id', '=', orgId)
    .execute()

  const data = {orgId}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'UpdateOrgPayload', data, subOptions)
  return data
}

export default updateOrg
