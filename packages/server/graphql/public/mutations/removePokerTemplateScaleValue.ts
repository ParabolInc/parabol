import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const removePokerTemplateScaleValue: MutationResolvers['removePokerTemplateScaleValue'] = async (
  _source,
  {scaleId, label},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  // AUTH
  const scale = await dataLoader.get('templateScales').load(scaleId)
  if (!scale || scale.removedAt) {
    return standardError(new Error('Did not find an active scale'), {userId: viewerId})
  }
  if (!isTeamMember(authToken, scale.teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  const {values: oldScaleValues} = scale
  const oldScaleValue = oldScaleValues.find((v) => v.label === label)

  // VALIDATION
  if (!oldScaleValue) {
    return standardError(new Error('Did not find an old scale value to remove'), {userId: viewerId})
  }

  // RESOLUTION
  await pg
    .deleteFrom('TemplateScaleValue')
    .where('templateScaleId', '=', scaleId)
    .where('label', '=', label)
    .execute()
  dataLoader.clearAll('templateScales')
  const data = {scaleId}
  publish(
    SubscriptionChannel.TEAM,
    scale.teamId,
    'RemovePokerTemplateScalePayload',
    data,
    subOptions
  )
  return data
}

export default removePokerTemplateScaleValue
