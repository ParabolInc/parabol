import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemovePokerTemplateScaleValuePayload from '../types/RemovePokerTemplateScaleValuePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TemplateScaleInput from '../types/TemplateScaleInput'

const removePokerTemplateScaleValue = {
  description: 'Remove a scale value from the scale of a template',
  type: new GraphQLNonNull(RemovePokerTemplateScaleValuePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    scaleValue: {
      type: new GraphQLNonNull(TemplateScaleInput)
    }
  },
  async resolve(_source, {scaleId, scaleValue}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const scale = await r
      .table('TemplateScale')
      .get(scaleId)
      .run()
    if (!scale || scale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, scale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    const {values: oldScaleValues} = scale
    const oldScaleValueIndex = oldScaleValues.findIndex(
      (oldScaleValue) =>
        oldScaleValue.value === scaleValue.value && oldScaleValue.label === scaleValue.label
    )

    // VALIDATION
    if (oldScaleValueIndex === -1) {
      return standardError(new Error('Did not find an old scale value to remove'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    await r
      .table('TemplateScale')
      .get(scaleId)
      .update((row) => ({
        values: row('values').deleteAt(oldScaleValueIndex),
        updatedAt: now
      }))
      .run()

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
}

export default removePokerTemplateScaleValue
