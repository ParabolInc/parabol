import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import dndNoise from 'parabol-client/utils/dndNoise'
import getRethink from '../../database/rethinkDriver'
import TemplateScale from '../../database/types/TemplateScale'
import TemplateScaleValue from '../../database/types/TemplateScaleValue'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddPokerTemplateScalePayload from '../types/AddPokerTemplateScalePayload'

const addPokerTemplateScale = {
  description: 'Add a new scale for the poker template',
  type: AddPokerTemplateScalePayload,
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
    const activeScales = await r
      .table('TemplateScale')
      .getAll(teamId, {index: 'teamId'})
      .filter({
        templateId,
        isActive: true
      })
      .run()
    if (activeScales.length >= Threshold.MAX_POKER_TEMPLDATE_SCALES) {
      return standardError(new Error('Too many scales'), {userId: viewerId})
    }

    // RESOLUTION
    const sortOrder = Math.max(...activeScales.map((scale) => scale.sortOrder)) + 1 + dndNoise()
    const newScale = new TemplateScale({
      sortOrder: sortOrder,
      name: `*New Scale #${activeScales.length + 1}`,
      values: [] as TemplateScaleValue[],
      teamId,
      templateId
    })

    await r
      .table('TemplateScale')
      .insert(newScale)
      .run()

    const scaleId = newScale.id
    const data = {scaleId}
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateScalePayload', data, subOptions)
    return data
  }
}

export default addPokerTemplateScale
