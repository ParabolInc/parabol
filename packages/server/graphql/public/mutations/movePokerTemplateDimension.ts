import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const movePokerTemplateDimension: MutationResolvers['movePokerTemplateDimension'] = async (
  _source,
  {dimensionId, sortOrder},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const dimension = await dataLoader.get('templateDimensions').load(dimensionId)
  const viewerId = getUserId(authToken)

  // AUTH
  if (!dimension || dimension.removedAt) {
    return standardError(new Error('Dimension not found'), {userId: viewerId})
  }
  if (!isTeamMember(authToken, dimension.teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  const {teamId} = dimension
  await pg.updateTable('TemplateDimension').set({sortOrder}).where('id', '=', dimensionId).execute()
  dataLoader.clearAll('templateDimensions')
  const data = {dimensionId}
  publish(SubscriptionChannel.TEAM, teamId, 'MovePokerTemplateDimensionPayload', data, subOptions)
  return data
}

export default movePokerTemplateDimension
