import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getSortOrder} from '../../../client/shared/sortOrder'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
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
    const {color, label} = scaleValue
    if (!validateColorValue(color)) {
      return standardError(new Error('Invalid scale color'), {userId: viewerId})
    }
    if (!validateScaleLabel(label)) {
      return standardError(new Error('Invalid scale label'), {userId: viewerId})
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
        return {error: {message: 'Scale labels and/or numerical values are not unique'}}
      }
      return {error: {message: 'Could not add scale value'}}
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
}

export default addPokerTemplateScaleValue
