import {GraphQLError} from 'graphql'
import {PokerCards, SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import {PALETTE} from '../../../../client/styles/paletteV3'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

export const addPokerTemplateScale: MutationResolvers['addPokerTemplateScale'] = async (
  _source,
  {parentScaleId, teamId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // VALIDATION
  const activeScales = await dataLoader.get('scalesByTeamId').load(teamId)
  if (activeScales.length >= Threshold.MAX_POKER_TEMPLATE_SCALES) {
    throw new GraphQLError('Too many scales', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  // RESOLUTION
  let newScaleId: string | undefined
  let newScaleName: string

  if (parentScaleId) {
    const parentScale = await dataLoader.get('templateScales').load(parentScaleId)
    if (!parentScale) {
      throw new GraphQLError('Parent scale not found', {extensions: {code: 'NOT_FOUND'}})
    }
    if (!parentScale.isStarter && parentScale.teamId !== teamId) {
      throw new GraphQLError('Cannot copy from a scale not owned by the team', {
        extensions: {code: 'FORBIDDEN'}
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
  publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateScalePayload', data, subOptions)
  return data
}
