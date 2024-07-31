import {GraphQLID, GraphQLNonNull} from 'graphql'
import {PokerCards, SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../client/shared/sortOrder'
import {PALETTE} from '../../../client/styles/paletteV3'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddPokerTemplateScalePayload from '../types/AddPokerTemplateScalePayload'

const addPokerTemplateScale = {
  description: 'Add a new scale for the poker template',
  type: new GraphQLNonNull(AddPokerTemplateScalePayload),
  args: {
    parentScaleId: {
      type: GraphQLID
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {parentScaleId, teamId}: {parentScaleId?: string | null; teamId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const [activeScales, viewer] = await Promise.all([
      dataLoader.get('scalesByTeamId').load(teamId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
    if (activeScales.length >= Threshold.MAX_POKER_TEMPLATE_SCALES) {
      return standardError(new Error('Too many scales'), {userId: viewerId})
    }

    // RESOLUTION
    let newScaleId: string | undefined
    let newScaleName: string

    if (parentScaleId) {
      const parentScale = await dataLoader.get('templateScales').load(parentScaleId)
      if (!parentScale) {
        return standardError(new Error('Parent scale not found'), {userId: viewerId})
      }
      if (!parentScale.isStarter && parentScale.teamId !== teamId) {
        return standardError(new Error('Cannot copy from a scale not owned by the team'), {
          userId: viewerId
        })
      }
      const {name} = parentScale
      const copyName = `${name} Copy`
      const re = new RegExp(`^${copyName}`)
      const existingCopyCount = activeScales.filter(({name}) => name.match(re)).length
      newScaleName = existingCopyCount === 0 ? copyName : `${copyName} #${existingCopyCount + 1}`
      const res = await pg
        .with('TemplateScaleInsert', (qc) =>
          qc
            .insertInto('TemplateScale')
            .values({
              id: generateUID(),
              name: newScaleName,
              teamId,
              parentScaleId
            })
            .returning(['id', 'parentScaleId'])
        )
        .insertInto('TemplateScaleValue')
        .columns(['templateScaleId', 'sortOrder', 'color', 'label'])
        .expression(({selectFrom}) =>
          selectFrom('TemplateScaleValue')
            .innerJoin(
              'TemplateScaleInsert',
              'TemplateScaleValue.templateScaleId',
              'TemplateScaleInsert.parentScaleId'
            )
            .select(({ref}) => [
              ref('TemplateScaleInsert.id').as('templateScaleId'),
              ref('TemplateScaleValue.sortOrder').as('sortOrder'),
              ref('TemplateScaleValue.color').as('color'),
              ref('TemplateScaleValue.label').as('label')
            ])
        )
        .returning('TemplateScaleValue.templateScaleId')
        .executeTakeFirstOrThrow()
      newScaleId = res.templateScaleId
    } else {
      newScaleName = `*New Scale #${activeScales.length + 1}`
      const res = await pg
        .with('TemplateScaleInsert', (qc) =>
          qc
            .insertInto('TemplateScale')
            .values({
              id: generateUID(),
              name: newScaleName,
              teamId
            })
            .returning('id as templateScaleId')
        )
        .insertInto('TemplateScaleValue')
        .values(({selectFrom}) => [
          {
            templateScaleId: selectFrom('TemplateScaleInsert').select('templateScaleId'),
            color: PALETTE.FUSCIA_400,
            label: PokerCards.QUESTION_CARD as string,
            sortOrder: positionAfter('')
          },
          {
            templateScaleId: selectFrom('TemplateScaleInsert').select('templateScaleId'),
            color: PALETTE.GRAPE_500,
            label: PokerCards.PASS_CARD as string,
            sortOrder: positionAfter(positionAfter(''))
          }
        ])
        .returning('templateScaleId')
        .executeTakeFirstOrThrow()
      newScaleId = res.templateScaleId
    }
    dataLoader.clearAll('templateScales')
    const data = {scaleId: newScaleId}
    analytics.scaleMetrics(
      viewer,
      {id: newScaleId, name: newScaleName, teamId},
      parentScaleId ? 'Scale Cloned' : 'Scale Created'
    )
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateScalePayload', data, subOptions)
    return data
  }
}

export default addPokerTemplateScale
