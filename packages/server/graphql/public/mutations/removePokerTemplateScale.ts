import {GraphQLError} from 'graphql/error'
import {sql} from 'kysely'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removePokerTemplateScale: MutationResolvers['removePokerTemplateScale'] = async (
  _source,
  {scaleId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const scale = await dataLoader.get('templateScales').load(scaleId)

  // AUTH
  if (!scale || scale.removedAt) {
    throw new GraphQLError('Scale not found')
  }
  const {teamId} = scale
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

  const data = {scaleId, dimensions, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplateScalePayload', data, subOptions)
  return data
}

export default removePokerTemplateScale
