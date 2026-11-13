import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isSpecialPokerLabel from 'parabol-client/utils/isSpecialPokerLabel'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import {validateColorValue, validateScaleLabel} from '../../mutations/helpers/validateScaleValue'
import type {MutationResolvers} from '../resolverTypes'

const updatePokerTemplateScaleValue: MutationResolvers['updatePokerTemplateScaleValue'] = async (
  _source,
  {scaleId, oldScaleValue, newScaleValue},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // VALIDATION
  const existingScale = await dataLoader.get('templateScales').load(scaleId)
  if (!existingScale || existingScale.removedAt) {
    throw new GraphQLError('Did not find an active scale', {extensions: {code: 'NOT_FOUND'}})
  }

  // VALIDATION
  const {label: oldScaleLabel} = oldScaleValue
  const {label: newScaleLabel} = newScaleValue
  if (isSpecialPokerLabel(oldScaleLabel) && oldScaleLabel !== newScaleLabel) {
    throw new GraphQLError('Cannot change the label for a special scale value', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const {values: oldScaleValues} = existingScale
  const oldScaleValueIndex = oldScaleValues.findIndex(
    (scaleValue) => scaleValue.label === oldScaleLabel
  )
  if (oldScaleValueIndex === -1) {
    throw new GraphQLError('Did not find an existing scale value to update', {
      extensions: {code: 'NOT_FOUND'}
    })
  }

  const {color, label} = newScaleValue
  if (!validateColorValue(color)) {
    throw new GraphQLError('Invalid scale color', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (!isSpecialPokerLabel(label) && !validateScaleLabel(label)) {
    throw new GraphQLError('Invalid scale label', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  await pg
    .updateTable('TemplateScaleValue')
    .set({label, color})
    .where('templateScaleId', '=', scaleId)
    .where('label', '=', oldScaleLabel)
    .execute()
  dataLoader.clearAll('templateScales')

  const data = {scaleId}
  publish(
    SubscriptionChannel.TEAM,
    existingScale.teamId,
    'UpdatePokerTemplateScaleValuePayload',
    data,
    subOptions
  )
  return data
}

export default updatePokerTemplateScaleValue
