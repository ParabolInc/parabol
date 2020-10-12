import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import dndNoise from 'parabol-client/utils/dndNoise'
import getRethink from '../../database/rethinkDriver'
import TemplateScale from '../../database/types/TemplateScale'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import AddPokerTemplateScalePayload from '../types/AddPokerTemplateScalePayload'

const addPokerTemplateScale = {
  description: 'Add a new scale for the poker template',
  type: AddPokerTemplateScalePayload,
  args: {
    parentScaleId: {
      type: GraphQLID
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(_source, {parentScaleId, teamId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const activeScales = await r
      .table('TemplateScale')
      .getAll(teamId, {index: 'teamId'})
      .filter((row) => row.hasFields('removedAt').not())
      .run()
    if (activeScales.length >= Threshold.MAX_POKER_TEMPLDATE_SCALES) {
      return standardError(new Error('Too many scales'), {userId: viewerId})
    }

    // RESOLUTION
    let newScale
    const sortOrder =
      activeScales.length > 0
        ? Math.max(...activeScales.map((scale) => scale.sortOrder)) + 1 + dndNoise()
        : 0
    if (parentScaleId) {
      const parentScale = await dataLoader.get('TemplateScales').load(parentScaleId)
      if (!parentScale) {
        return standardError(new Error('Parent scale not found'), {userId: viewerId})
      }
      const {name} = parentScale
      const copyName = `${name} Copy`
      const existingCopyCount = await r
        .table('TemplateScale')
        .getAll(teamId, {index: 'teamId'})
        .filter((row) => row.hasFields('removedAt').not())
        .filter((row) => row('name').match(`^${copyName}`) as any)
        .count()
        .run()
      const newName = existingCopyCount === 0 ? copyName : `${copyName} #${existingCopyCount + 1}`
      newScale = new TemplateScale({
        sortOrder,
        name: newName,
        teamId,
        parentScaleId
      })
    } else {
      newScale = new TemplateScale({
        sortOrder,
        name: `*New Scale #${activeScales.length + 1}`,
        teamId
      })
    }

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
