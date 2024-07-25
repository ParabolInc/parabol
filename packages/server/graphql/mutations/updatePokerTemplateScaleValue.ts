import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import isSpecialPokerLabel from 'parabol-client/utils/isSpecialPokerLabel'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import TemplateScaleInput, {TemplateScaleInputType} from '../types/TemplateScaleInput'
import UpdatePokerTemplateScaleValuePayload from '../types/UpdatePokerTemplateScaleValuePayload'
import {validateColorValue, validateScaleLabel} from './helpers/validateScaleValue'

const updatePokerTemplateScaleValue = {
  description: 'Update the label, numerical value or color of a scale value in a scale',
  type: new GraphQLNonNull(UpdatePokerTemplateScaleValuePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    oldScaleValue: {
      type: new GraphQLNonNull(TemplateScaleInput)
    },
    newScaleValue: {
      type: new GraphQLNonNull(TemplateScaleInput)
    }
  },
  async resolve(
    _source: unknown,
    {
      scaleId,
      oldScaleValue,
      newScaleValue
    }: {
      scaleId: string
      oldScaleValue: TemplateScaleInputType
      newScaleValue: TemplateScaleInputType
    },
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const existingScale = await dataLoader.get('templateScales').load(scaleId)
    if (!existingScale || existingScale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, existingScale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {label: oldScaleLabel} = oldScaleValue
    const {label: newScaleLabel} = newScaleValue
    if (isSpecialPokerLabel(oldScaleLabel) && oldScaleLabel !== newScaleLabel) {
      return {error: {message: 'Cannot change the label for a special scale value'}}
    }

    const {values: oldScaleValues} = existingScale
    const oldScaleValueIndex = oldScaleValues.findIndex(
      (scaleValue) => scaleValue.label === oldScaleLabel
    )
    if (oldScaleValueIndex === -1) {
      return standardError(new Error('Did not find an existing scale value to update'), {
        userId: viewerId
      })
    }

    const {color, label} = newScaleValue
    if (!validateColorValue(color)) {
      return standardError(new Error('Invalid scale color'), {userId: viewerId})
    }
    if (!isSpecialPokerLabel(label) && !validateScaleLabel(label)) {
      return standardError(new Error('Invalid scale label'), {userId: viewerId})
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
}

export default updatePokerTemplateScaleValue
