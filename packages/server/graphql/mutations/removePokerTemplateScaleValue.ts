import {GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import RemovePokerTemplateScaleValuePayload from '../types/RemovePokerTemplateScaleValuePayload'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

const removePokerTemplateScaleValue = {
  description: 'Remove a scale value from the scale of a template',
  type: RemovePokerTemplateScaleValuePayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    scaleId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    index: {
      type: GraphQLInt,
      description: 'Index of the scale value to be deleted. Default to the last scale value.'
    }
  },
  async resolve(
    _source,
    {templateId, scaleId, index},
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
    if (!scale || scale.templateId != templateId || scale.teamId != template.teamId) {
      return standardError(new Error('Did not find an active scale'), {userId: viewerId})
    }
    const endIndex = scale.values.length - 1
    if (index > endIndex || index < 0) {
      return standardError(new Error('Invalid index'), {userId: viewerId})
    }

    // RESOLUTION
    await r
      .table('TemplateScale')
      .get(scaleId)
      .update((row) => ({
        values: row('values').deleteAt(index || endIndex)
      }))
      .run()

    const data = {scaleId, templateId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplateScalePayload', data, subOptions)
    return data
  }
}

export default removePokerTemplateScaleValue
