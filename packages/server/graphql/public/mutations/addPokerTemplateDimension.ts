import {GraphQLError} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const addPokerTemplateDimension: MutationResolvers['addPokerTemplateDimension'] = async (
  _source,
  {templateId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const [template, activeDimensions] = await Promise.all([
    dataLoader.get('meetingTemplates').load(templateId),
    dataLoader.get('templateDimensionsByTemplateId').load(templateId)
  ])

  // VALIDATION
  if (!template || !template.isActive) {
    throw new GraphQLError('Template not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {teamId} = template
  if (activeDimensions.length >= Threshold.MAX_POKER_TEMPLATE_DIMENSIONS) {
    throw new GraphQLError('Too many dimensions', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  // RESOLUTION
  const lastSortOrder = activeDimensions.at(-1)?.sortOrder ?? ''
  const sortOrder = positionAfter(lastSortOrder)
  const rawAvailableScales = await dataLoader.get('scalesByTeamId').load(teamId)
  const availableScales = rawAvailableScales.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
  const defaultScaleId = availableScales[0]?.id ?? SprintPokerDefaults.DEFAULT_SCALE_ID

  const res = await pg
    .insertInto('TemplateDimension')
    .values({
      id: generateUID(),
      scaleId: defaultScaleId as string,
      sortOrder,
      name: `*New Dimension #${activeDimensions.length + 1}`,
      teamId,
      templateId
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  dataLoader.clearAll('templateDimensions')
  const dimensionId = res.id
  const data = {dimensionId}

  publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateDimensionPayload', data, subOptions)

  return data
}

export default addPokerTemplateDimension
