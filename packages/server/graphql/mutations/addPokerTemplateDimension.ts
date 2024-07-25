import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../client/shared/sortOrder'
import generateUID from '../../generateUID'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddPokerTemplateDimensionPayload from '../types/AddPokerTemplateDimensionPayload'

const addPokerTemplateDimension = {
  description: 'Add a new dimension for the poker template',
  type: new GraphQLNonNull(AddPokerTemplateDimensionPayload),
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {templateId}: {templateId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const [template, activeDimensions] = await Promise.all([
      dataLoader.get('meetingTemplates').load(templateId),
      dataLoader.get('templateDimensionsByTemplateId').load(templateId)
    ])
    const viewerId = getUserId(authToken)

    // AUTH
    if (!template || !template.isActive) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, template.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = template
    if (activeDimensions.length >= Threshold.MAX_POKER_TEMPLATE_DIMENSIONS) {
      return standardError(new Error('Too many dimensions'), {userId: viewerId})
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
}

export default addPokerTemplateDimension
