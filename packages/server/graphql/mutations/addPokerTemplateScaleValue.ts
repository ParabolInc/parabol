import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {getSortOrder} from '../../utils/sortOrder'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddPokerTemplateScaleValuePayload from '../types/AddPokerTemplateScaleValuePayload'
import AddTemplateScaleInput, {AddTemplateScaleInputType} from '../types/AddTemplateScaleInput'
import {validateColorValue, validateScaleLabel} from './helpers/validateScaleValue'

const addPokerTemplateScaleValue = {
  description: 'Add a new scale value for a scale in a poker template',
  type: new GraphQLNonNull(AddPokerTemplateScaleValuePayload),
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    scaleValue: {
      type: new GraphQLNonNull(AddTemplateScaleInput)
    }
  },
  async resolve(
    _source: unknown,
    {scaleId, scaleValue}: {scaleId: string; scaleValue: AddTemplateScaleInputType},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const pg = getKysely()
    const now = new Date()
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
    const {color, label} = scaleValue
    if (!validateColorValue(color)) {
      return standardError(new Error('Invalid scale color'), {userId: viewerId})
    }
    if (!validateScaleLabel(label)) {
      return standardError(new Error('Invalid scale label'), {userId: viewerId})
    }
    const {values} = existingScale
    const endCardIdx = values.findIndex(({label}) => ['?', 'Pass'].includes(label))
    const endCardSortOrder = values[endCardIdx]?.sortOrder
    const startCardSortOrder = values[endCardIdx - 1]?.sortOrder

    const sortOrder = getSortOrder(startCardSortOrder, endCardSortOrder)
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
        return {error: {message: 'Scale labels and/or numerical values are not unique'}}
      }
      return {error: {message: 'Could not add scale value'}}
    }
    dataLoader.clearAll('templateScales')
    // mark all templates using this scale as updated
    const updatedDimensions = await r
      .table('TemplateDimension')
      .getAll(scaleId, {index: 'scaleId'})
      .run()
    const updatedTemplateIds = updatedDimensions.map(({templateId}) => templateId)
    if (updatedTemplateIds.length) {
      await pg
        .updateTable('MeetingTemplate')
        .set({updatedAt: now})
        .where('id', 'in', updatedTemplateIds)
        .execute()
    }
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
}

export default addPokerTemplateScaleValue
