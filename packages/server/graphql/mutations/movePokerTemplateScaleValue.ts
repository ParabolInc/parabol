import {GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {getSortOrder} from '../../utils/sortOrder'
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
    const r = await getRethink()
    const pg = getKysely()
    const viewerId = getUserId(authToken)
    const now = new Date()
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
    const secondPosItem = scale.values[index]
    if (index < 0 || index >= scale.values.length - 2 || !secondPosItem) {
      return standardError(new Error('Invalid index to move to'), {userId: viewerId})
    }
    const firstPosItem = scale.values[index - 1]
    const item = scale.values.find((scaleValue) => scaleValue.label === label)
    if (!item) {
      return standardError(new Error('Did not find an existing scale value to move'), {
        userId: viewerId
      })
    }

    // RESOLUTION
    const sortOrder = getSortOrder(firstPosItem?.sortOrder, secondPosItem.sortOrder)
    await pg
      .updateTable('TemplateScaleValue')
      .set({sortOrder})
      .where('templateScaleId', '=', scale.id)
      .where('label', '=', label)
      .execute()

    // mark all templates using this scale as updated
    const updatedDimensions = await r
      .table('TemplateDimension')
      .getAll(scaleId, {index: 'scaleId'})
      .run()
    const updatedTemplateIds = updatedDimensions.map(({templateId}) => templateId)
    await pg
      .updateTable('MeetingTemplate')
      .set({updatedAt: now})
      .where('id', 'in', updatedTemplateIds)
      .execute()

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
