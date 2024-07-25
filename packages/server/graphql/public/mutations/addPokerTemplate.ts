import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import PokerTemplate from '../../../database/types/PokerTemplate'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import decrementFreeTemplatesRemaining from '../../../postgres/queries/decrementFreeTemplatesRemaining'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import getTemplateIllustrationUrl from '../../mutations/helpers/getTemplateIllustrationUrl'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {MutationResolvers} from '../resolverTypes'

const addPokerTemplate: MutationResolvers['addPokerTemplate'] = async (
  _source,
  {teamId, parentTemplateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
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
  if (getFeatureTier(viewerTeam) === 'starter' && viewer.freeCustomPokerTemplatesRemaining === 0) {
    return standardError(new Error('You have reached the limit of free custom templates.'), {
      userId: viewerId
    })
  } else {
    decrementFreeTemplatesRemaining(viewerId, 'poker')
    viewer.freeCustomPokerTemplatesRemaining = viewer.freeCustomPokerTemplatesRemaining - 1
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

    const activeDimensions = await dataLoader
      .get('templateDimensionsByTemplateId')
      .load(parentTemplate.id)
    const newTemplateDimensions = activeDimensions.map((dimension) => ({
      ...dimension,
      id: generateUID(),
      teamId,
      templateId: newTemplate.id
    }))
    await Promise.all([
      getKysely()
        .with('MeetingTemplateInsert', (qc) => qc.insertInto('MeetingTemplate').values(newTemplate))
        .insertInto('TemplateDimension')
        .values(newTemplateDimensions)
        .execute(),
      decrementFreeTemplatesRemaining(viewerId, 'poker')
    ])
    dataLoader.clearAll(['users', 'meetingTemplates', 'templateDimensions'])
    viewer.freeCustomPokerTemplatesRemaining = viewer.freeCustomPokerTemplatesRemaining - 1
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

    await Promise.all([
      getKysely()
        .with('MeetingTemplateInsert', (qc) => qc.insertInto('MeetingTemplate').values(newTemplate))
        .insertInto('TemplateDimension')
        .values({
          id: generateUID(),
          scaleId: SprintPokerDefaults.DEFAULT_SCALE_ID,
          description: '',
          sortOrder: positionAfter(''),
          name: '*New Dimension',
          teamId,
          templateId
        })
        .execute(),
      decrementFreeTemplatesRemaining(viewerId, 'poker')
    ])
    dataLoader.clearAll(['users', 'meetingTemplates', 'templateDimensions'])
    viewer.freeCustomPokerTemplatesRemaining = viewer.freeCustomPokerTemplatesRemaining - 1
    analytics.templateMetrics(viewer, newTemplate, 'Template Created')
    data = {templateId}
  }
  publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateSuccess', data, subOptions)
  return data
}

export default addPokerTemplate
