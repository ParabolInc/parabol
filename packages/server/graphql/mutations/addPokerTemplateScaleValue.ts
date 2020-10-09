import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import TemplateScaleInput from '../types/TemplateScaleInput'
import AddPokerTemplateScaleValuePayload from '../types/AddPokerTemplateScaleValuePayload'

const addPokerTemplateScaleValue = {
  description: 'Add a new scale value for a scale in a poker template',
  type: AddPokerTemplateScaleValuePayload,
  args: {
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    scaleValue: {
      type: new GraphQLNonNull(TemplateScaleInput)
    },
    index: {
      type: GraphQLInt
    }
  },
  async resolve(
    _source,
    {templateId, scaleId, scaleValue, index},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = await r
      .table('MeetingTemplate')
      .get(templateId)
      .run()
    const viewerId = getUserId(authToken)

    // AUTH
    if (!template || !isTeamMember(authToken, template.teamId) || !template.isActive) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = template
    const scale = await r
      .table('TemplateScale')
      .get(scaleId)
      .run()
    if (!scale || scale.teamId != template.teamId) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    const endIndex = scale.values.length - 1
    if (index > endIndex || index < 0) {
      return standardError(new Error('Invalid index'), {userId: viewerId})
    }

    await r
      .table('TemplateScale')
      .get(scaleId)
      .update((row) => ({
        values: row('values').insertAt(index || endIndex + 1, scaleValue)
      }))
      .run()

    const data = {scaleId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateScaleValuePayload', data, subOptions)
    return data
  }
}

export default addPokerTemplateScaleValue
