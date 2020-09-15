import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import dndNoise from 'parabol-client/utils/dndNoise'
import getRethink from '../../database/rethinkDriver'
import TemplateDimension from '../../database/types/TemplateDimension'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddPokerTemplateDimensionPayload from '../types/AddPokerTemplateDimensionPayload'
import {makePokerTemplateDimensionScale} from './helpers/makePokerTemplates'

const addPokerTemplateDimension = {
  description: 'Add a new dimension for the poker template',
  type: AddPokerTemplateDimensionPayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {templateId}, {authToken, dataLoader, socketId: mutatorId}) {
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
    const activeDimensions = await r
      .table('TemplateDimension')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        templateId,
        isActive: true
      })
      .run()
    if (activeDimensions.length >= Threshold.MAX_POKER_TEMPLDATE_DIMENSIONS) {
      return standardError(new Error('Too many dimensions'), {userId: viewerId})
    }

    const newScale = makePokerTemplateDimensionScale(template.teamId, template.id)

    // RESOLUTION
    const sortOrder =
      Math.max(...activeDimensions.map((prompt) => prompt.sortOrder)) + 1 + dndNoise()
    const newDimension = new TemplateDimension({
      name: `New dimension #${activeDimensions.length + 1}`,
      teamId: template.teamId,
      sortOrder,
      templateId: template.id,
      scaleId: newScale.id
    })

    await r
      .table('TemplateScale')
      .insert(newScale)
      .run()

    await r
      .table('TemplateDimension')
      .insert(newDimension)
      .run()

    const dimensionId = newDimension.id
    const data = {dimensionId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateDimensionPayload', data, subOptions)
    return data
  }
}

export default addPokerTemplateDimension
