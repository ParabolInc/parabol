import {sql} from 'kysely'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const removePokerTemplateScale: MutationResolvers['removePokerTemplateScale'] = async (
  _source,
  {scaleId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const scale = await dataLoader.get('templateScales').load(scaleId)
  const viewerId = getUserId(authToken)

  // AUTH
  if (!scale || scale.removedAt) {
    return standardError(new Error('Scale not found'), {userId: viewerId})
  }
  const {teamId} = scale
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  await pg
    .updateTable('TemplateScale')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('id', '=', scaleId)
    .execute()

  const nextDefaultScaleId = SprintPokerDefaults.DEFAULT_SCALE_ID

  await pg
    .updateTable('TemplateDimension')
    .set({scaleId: nextDefaultScaleId})
    .where('scaleId', '=', scaleId)
    .where('removedAt', 'is', null)
    .execute()
  dataLoader.clearAll(['templateDimensions', 'templateScales'])
  const dimensions = await dataLoader.get('templateDimensionsByScaleId').load(scaleId)

  const data = {scaleId, dimensions}
  publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplateScalePayload', data, subOptions)
  return data
}

export default removePokerTemplateScale
