import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import PokerTemplate from '../../database/types/PokerTemplate'
import TemplateDimension from '../../database/types/TemplateDimension'
import insertMeetingTemplate from '../../postgres/queries/insertMeetingTemplate'
import {getUserId, isTeamMember, isUserInOrg} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import AddPokerTemplatePayload from '../types/AddPokerTemplatePayload'
import getTemplateIllustrationUrl from './helpers/getTemplateIllustrationUrl'
import {analytics} from '../../utils/analytics/analytics'
import {getFeatureTier} from '../types/helpers/getFeatureTier'

const addPokerTemplate = {
  description: 'Add a new poker template with a default dimension created',
  type: new GraphQLNonNull(AddPokerTemplatePayload),
  args: {
    parentTemplateId: {
      type: GraphQLID
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {parentTemplateId, teamId}: {parentTemplateId?: string | null; teamId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const [allTemplates, viewerTeam, viewer] = await Promise.all([
      dataLoader.get('meetingTemplatesByType').load({meetingType: 'poker', teamId}),
      dataLoader.get('teams').load(teamId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])

    if (!viewerTeam) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (
      getFeatureTier(viewerTeam) === 'starter' &&
      !viewer.featureFlags.includes('noTemplateLimit')
    ) {
      return standardError(new Error('Creating templates is a premium feature'), {userId: viewerId})
    }
    let data
    if (parentTemplateId) {
      const parentTemplate = await dataLoader.get('meetingTemplates').load(parentTemplateId)
      if (!parentTemplate) {
        return standardError(new Error('Parent template not found'), {userId: viewerId})
      }
      const {name, scope} = parentTemplate
      if (scope === 'TEAM') {
        if (!isTeamMember(authToken, parentTemplate.teamId))
          return standardError(new Error('Template is scoped to team'), {userId: viewerId})
      } else if (scope === 'ORGANIZATION') {
        const parentTemplateTeam = await dataLoader.get('teams').load(parentTemplate.teamId)
        const isInOrg =
          parentTemplateTeam &&
          (await isUserInOrg(getUserId(authToken), parentTemplateTeam?.orgId, dataLoader))
        if (!isInOrg) {
          return standardError(new Error('Template is scoped to organization'), {userId: viewerId})
        }
      }
      const copyName = `${name} Copy`
      const existingCopyCount = allTemplates.filter((template) =>
        template.name.startsWith(copyName)
      ).length
      const newName = existingCopyCount === 0 ? copyName : `${copyName} #${existingCopyCount + 1}`
      const newTemplate = new PokerTemplate({
        name: newName,
        teamId,
        orgId: viewerTeam.orgId,
        parentTemplateId,
        mainCategory: parentTemplate.mainCategory,
        illustrationUrl: parentTemplate.illustrationUrl
      })

      const dimensions = await dataLoader
        .get('templateDimensionsByTemplateId')
        .load(parentTemplate.id)
      const activeDimensions = dimensions.filter(({removedAt}: TemplateDimension) => !removedAt)
      const newTemplateDimensions = activeDimensions.map((dimension: TemplateDimension) => {
        return new TemplateDimension({
          ...dimension,
          teamId,
          templateId: newTemplate.id
        })
      })

      await Promise.all([
        r.table('TemplateDimension').insert(newTemplateDimensions).run(),
        insertMeetingTemplate(newTemplate)
      ])
      analytics.templateMetrics(viewer, newTemplate, 'Template Cloned')
      data = {templateId: newTemplate.id}
    } else {
      const {orgId} = viewerTeam

      const templateCount = allTemplates.length
      const newTemplate = new PokerTemplate({
        name: `*New Template #${templateCount + 1}`,
        teamId,
        orgId,
        mainCategory: 'estimation',
        illustrationUrl: getTemplateIllustrationUrl('estimatedEffortTemplate.png')
      })
      const templateId = newTemplate.id
      const newDimension = new TemplateDimension({
        scaleId: SprintPokerDefaults.DEFAULT_SCALE_ID,
        description: '',
        sortOrder: 0,
        name: '*New Dimension',
        teamId,
        templateId
      })

      await Promise.all([
        r.table('TemplateDimension').insert(newDimension).run(),
        insertMeetingTemplate(newTemplate)
      ])
      analytics.templateMetrics(viewer, newTemplate, 'Template Created')
      data = {templateId}
    }
    publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplatePayload', data, subOptions)
    return data
  }
}

export default addPokerTemplate
