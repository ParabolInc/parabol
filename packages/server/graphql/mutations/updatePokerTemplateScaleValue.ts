import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import TemplateScaleInput from '../types/TemplateScaleInput'
import UpdatePokerTemplateScaleValuePayload from '../types/UpdatePokerTemplateScaleValuePayload'
import {
  validateColorValue,
  validateScaleLabel,
  validateScaleLabelValueUniqueness
} from './helpers/validateScaleValue'

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
    _source,
    {scaleId, oldScaleValue, newScaleValue},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const existingScale = await r.table('TemplateScale').get(scaleId).run()
    if (!existingScale || existingScale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, existingScale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const {values: oldScaleValues} = existingScale
    const oldScaleValueIndex = oldScaleValues.findIndex(
      (scaleValue) => scaleValue.label === oldScaleValue.label
    )
    if (oldScaleValueIndex === -1) {
      return standardError(new Error('Did not find an existing scale value to update'), {
        userId: viewerId
      })
    }
    const isExistingScaleValueSpecial = !!oldScaleValues[oldScaleValueIndex].isSpecial

    // VALIDATION
    const {color, label, value} = newScaleValue
    if (isExistingScaleValueSpecial && value !== oldScaleValue.value) {
      return standardError(new Error('Cannot update the value for a special scale'), {
        userId: viewerId
      })
    }
    if (!validateColorValue(color)) {
      return standardError(new Error('Invalid scale color'), {userId: viewerId})
    }
    if (!validateScaleLabel(label)) {
      return standardError(new Error('Invalid scale label'), {userId: viewerId})
    }

    await r
      .table('TemplateScale')
      .get(scaleId)
      .update((row) => ({
        values: row('values').changeAt(oldScaleValueIndex, {
          ...newScaleValue,
          isSpecial: isExistingScaleValueSpecial
        }),
        updatedAt: now
      }))
      .run()
    const updatedScale = await r.table('TemplateScale').get(scaleId).run()

    if (!validateScaleLabelValueUniqueness(updatedScale.values)) {
      // updated values or labels are not unique, rolling back
      await r
        .table('TemplateScale')
        .get(scaleId)
        .update({
          values: existingScale.values,
          updatedAt: existingScale.updatedAt
        })
        .run()
      return standardError(new Error('Scale labels and/or numerical values are not unique'), {
        userId: viewerId
      })
    }

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
