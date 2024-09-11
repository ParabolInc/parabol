import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {PALETTE} from '../../../../client/styles/paletteV3'
import ReflectTemplate from '../../../database/types/ReflectTemplate'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import decrementFreeTemplatesRemaining from '../../../postgres/queries/decrementFreeTemplatesRemaining'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import makeRetroTemplates from '../../mutations/helpers/makeRetroTemplates'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {MutationResolvers} from '../resolverTypes'

const addPokerTemplate: MutationResolvers['addPokerTemplate'] = async (
  _source,
  {teamId, parentTemplateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  // AUTH
  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // VALIDATION
  const [allTemplates, viewerTeam, viewer] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: 'retrospective', teamId}),
    dataLoader.get('teams').load(teamId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])

  if (!viewerTeam) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }
  if (getFeatureTier(viewerTeam) === 'starter' && viewer.freeCustomRetroTemplatesRemaining === 0) {
    return standardError(new Error('You have reached the limit of free custom templates.'), {
      userId: viewerId
    })
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
    const newTemplate = new ReflectTemplate({
      name: newName,
      teamId,
      orgId: viewerTeam.orgId,
      parentTemplateId,
      illustrationUrl: parentTemplate.illustrationUrl,
      mainCategory: parentTemplate.mainCategory
    })
    const prompts = await dataLoader.get('reflectPromptsByTemplateId').load(parentTemplate.id)
    const activePrompts = prompts.filter(({removedAt}) => !removedAt)
    const newTemplatePrompts = activePrompts.map((prompt) => {
      return {
        id: generateUID(),
        teamId,
        templateId: newTemplate.id,
        parentPromptId: prompt.id,
        sortOrder: prompt.sortOrder,
        question: prompt.question,
        description: prompt.description,
        groupColor: prompt.groupColor,
        removedAt: null
      }
    })
    await Promise.all([
      pg
        .with('MeetingTemplateInsert', (qc) => qc.insertInto('MeetingTemplate').values(newTemplate))
        .insertInto('ReflectPrompt')
        .values(newTemplatePrompts.map((p) => ({...p, sortOrder: String(p.sortOrder)})))
        .execute(),
      decrementFreeTemplatesRemaining(viewerId, 'retro')
    ])
    viewer.freeCustomRetroTemplatesRemaining = viewer.freeCustomRetroTemplatesRemaining - 1
    analytics.templateMetrics(viewer, newTemplate, 'Template Cloned')
    data = {templateId: newTemplate.id}
  } else {
    const {orgId} = viewerTeam
    // RESOLUTION
    const templateCount = allTemplates.length
    const base = {
      [`*New Template #${templateCount + 1}`]: [
        {
          question: 'New prompt',
          description: '',
          groupColor: PALETTE.JADE_400
        }
      ]
    } as const
    const {reflectPrompts: newTemplatePrompts, templates} = makeRetroTemplates(teamId, orgId, base)
    // guaranteed since base has 1 key
    const newTemplate = templates[0]!
    const {id: templateId} = newTemplate
    await Promise.all([
      pg
        .with('MeetingTemplateInsert', (qc) => qc.insertInto('MeetingTemplate').values(newTemplate))
        .insertInto('ReflectPrompt')
        .values(newTemplatePrompts)
        .execute(),
      decrementFreeTemplatesRemaining(viewerId, 'retro')
    ])
    viewer.freeCustomRetroTemplatesRemaining = viewer.freeCustomRetroTemplatesRemaining - 1
    analytics.templateMetrics(viewer, newTemplate, 'Template Created')
    data = {templateId}
  }
  publish(SubscriptionChannel.TEAM, teamId, 'AddReflectTemplateSuccess', data, subOptions)
  return data
}

export default addPokerTemplate
