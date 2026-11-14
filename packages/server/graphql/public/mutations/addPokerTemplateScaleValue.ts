import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getSortOrder} from '../../../../client/shared/sortOrder'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import {validateColorValue, validateScaleLabel} from '../../mutations/helpers/validateScaleValue'
import type {MutationResolvers} from '../resolverTypes'

export const addPokerTemplateScaleValue: MutationResolvers['addPokerTemplateScaleValue'] = async (
  _source,
  {scaleId, scaleValue},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const existingScale = await dataLoader.get('templateScales').load(scaleId)
  if (!existingScale || existingScale.removedAt) {
    throw new GraphQLError('Did not find an active scale', {extensions: {code: 'NOT_FOUND'}})
  }
  // VALIDATION
  const {color, label} = scaleValue
  if (!validateColorValue(color)) {
    throw new GraphQLError('Invalid scale color', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (!validateScaleLabel(label)) {
    throw new GraphQLError('Invalid scale label', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const {values} = existingScale
  const endCardIdx = values.findIndex(({label}) => ['?', 'Pass'].includes(label))
  const sortOrder = getSortOrder(values, endCardIdx + 1, endCardIdx)
  try {
    await pg
      .insertInto('TemplateScaleValue')
      .values({
        templateScaleId: scaleId,
        color,
        label,
        sortOrder
      })
      .execute()
  } catch (e) {
    if ((e as any).constraint === 'TemplateScaleValue_templateScaleId_label_key') {
      throw new GraphQLError('Scale labels and/or numerical values are not unique', {
        extensions: {code: 'CONFLICT'}
      })
    }
    throw new GraphQLError('Could not add scale value', {
      extensions: {code: 'INTERNAL_SERVER_ERROR'}
    })
  }
  dataLoader.clearAll('templateScales')
  const data = {scaleId}
  publish(
    SubscriptionChannel.TEAM,
    existingScale.teamId,
    'AddPokerTemplateScaleValuePayload',
    data,
    subOptions
  )
  return data
}
