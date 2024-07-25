import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getSortOrder} from '../../../client/shared/sortOrder'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import MovePokerTemplateScaleValuePayload from '../types/MovePokerTemplateScaleValuePayload'

const movePokerTemplateScaleValue = {
  type: new GraphQLNonNull(MovePokerTemplateScaleValuePayload),
  description: `Move a scale value to an index`,
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    label: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The label of the moving scale value'
    },
    index: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The index position where the scale value is moving to'
    }
  },
  resolve: async (
    _source: unknown,
    {scaleId, label, index}: {scaleId: string; label: string; index: number},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const pg = getKysely()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const scale = await dataLoader.get('templateScales').load(scaleId)

    //AUTH
    if (!scale || scale.removedAt) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, scale.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const itemIdx = scale.values.findIndex((scaleValue) => scaleValue.label === label)
    if (itemIdx === -1) {
      return standardError(new Error('Did not find an existing scale value to move'), {
        userId: viewerId
      })
    }
    if (index < 0 || index >= scale.values.length - 2) {
      return standardError(new Error('Invalid index to move to'), {userId: viewerId})
    }

    // RESOLUTION
    const sortOrder = getSortOrder(scale.values, itemIdx, index)
    await pg
      .updateTable('TemplateScaleValue')
      .set({sortOrder})
      .where('templateScaleId', '=', scale.id)
      .where('label', '=', label)
      .execute()
    dataLoader.clearAll('templateScales')
    const data = {scaleId}
    publish(
      SubscriptionChannel.TEAM,
      scale.teamId,
      'MovePokerTemplateScaleValueSuccess',
      data,
      subOptions
    )
    return data
  }
}

export default movePokerTemplateScaleValue
