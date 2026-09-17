import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import {PALETTE} from '../../../../client/styles/paletteV3'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import decrementFreeTemplatesRemaining from '../../../postgres/queries/decrementFreeTemplatesRemaining'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import getUserDetail from '../../../utils/getUserDetail'
import publish from '../../../utils/publish'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import type {MutationResolvers} from '../resolverTypes'
import promptTemplateRules from './helpers/promptTemplateRules'

const addPromptTemplate: MutationResolvers['addPromptTemplate'] = async (
  _source,
  {teamId, parentTemplateId, type},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  const [teamTemplates, viewerTeam, viewer, freeTemplatesRemaining] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: type, teamId}),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('users').loadNonNull(viewerId),
    getUserDetail(viewerId, promptTemplateRules[type].freeTemplatesColumn, dataLoader)
  ])
  const org = await dataLoader.get('organizations').loadNonNull(viewerTeam.orgId)
  if (getFeatureTier(org) === 'starter' && freeTemplatesRemaining === 0) {
    throw new GraphQLError('You have reached the limit of free custom templates.')
  }

  const parentTemplate = parentTemplateId
    ? await dataLoader.get('meetingTemplates').load(parentTemplateId)
    : null
  if (parentTemplateId) {
    if (!parentTemplate || !parentTemplate.isActive || parentTemplate.type !== type) {
      throw new GraphQLError('Parent template not found')
    }
    if (parentTemplate.scope === 'TEAM' && !isTeamMember(authToken, parentTemplate.teamId)) {
      throw new GraphQLError('Template is scoped to team')
    }
    if (parentTemplate.scope === 'ORGANIZATION') {
      const parentTemplateTeam = await dataLoader.get('teams').loadNonNull(parentTemplate.teamId)
      const isInOrg = await isUserInOrg(viewerId, parentTemplateTeam.orgId, dataLoader)
      if (!isInOrg) {
        throw new GraphQLError('Template is scoped to organization')
      }
    }
  }

  const rules = promptTemplateRules[type]
  const copyName = parentTemplate && `${parentTemplate.name} Copy`
  const existingCopyCount = copyName
    ? teamTemplates.filter((template) => template.name.startsWith(copyName)).length
    : 0
  const name = copyName
    ? existingCopyCount === 0
      ? copyName
      : `${copyName} #${existingCopyCount + 1}`
    : `*New Template #${teamTemplates.length + 1}`

  const newTemplate = {
    id: generateUID(),
    name,
    teamId,
    orgId: viewerTeam.orgId,
    type,
    scope: 'ORGANIZATION' as const,
    parentTemplateId: parentTemplate?.id ?? null,
    illustrationUrl: parentTemplate?.illustrationUrl ?? rules.illustrationUrl,
    mainCategory: parentTemplate?.mainCategory ?? rules.mainCategory
  }

  const parentPrompts = parentTemplate
    ? await dataLoader.get('templatePromptsByTemplateId').load(parentTemplate.id)
    : []
  const newPrompts = parentTemplate
    ? parentPrompts
        .filter(({removedAt}) => !removedAt)
        .map((prompt) => ({
          id: generateUID(),
          teamId,
          templateId: newTemplate.id,
          parentPromptId: prompt.id,
          sortOrder: prompt.sortOrder,
          question: prompt.question,
          description: prompt.description,
          groupColor: prompt.groupColor
        }))
    : [
        {
          id: generateUID(),
          teamId,
          templateId: newTemplate.id,
          parentPromptId: null,
          sortOrder: positionAfter(positionAfter('')),
          question: 'New prompt',
          description: '',
          groupColor: PALETTE.JADE_400
        }
      ]

  await Promise.all([
    pg
      .with('MeetingTemplateInsert', (qc) => qc.insertInto('MeetingTemplate').values(newTemplate))
      .insertInto('TemplatePrompt')
      .values(newPrompts)
      .execute(),
    decrementFreeTemplatesRemaining(viewerId, promptTemplateRules[type].freeTemplatesColumn)
  ])
  dataLoader.clearAll(['meetingTemplates', 'userDetails'])
  analytics.templateMetrics(
    viewer,
    newTemplate,
    parentTemplate ? 'Template Cloned' : 'Template Created'
  )

  const data = {templateId: newTemplate.id}
  publish(SubscriptionChannel.TEAM, teamId, 'AddPromptTemplateSuccess', data, subOptions)
  return data
}

export default addPromptTemplate
