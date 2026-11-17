import {GraphQLError} from 'graphql'
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
    throw new GraphQLError('Must provide a name', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  const normalizedName = name.trim()
  if (normalizedName.length < 2) {
    throw new GraphQLError('The “A Team” had a longer name than that', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (normalizedName.length > 50) {
    throw new GraphQLError('That isn’t very memorable. Maybe shorten it up?', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
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
