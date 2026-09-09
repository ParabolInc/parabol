import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import {PALETTE} from '../../../../client/styles/paletteV3'
import TeamPromptTemplate from '../../../database/types/TeamPromptTemplate'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import decrementFreeTemplatesRemaining from '../../../postgres/queries/decrementFreeTemplatesRemaining'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import type {MutationResolvers} from '../resolverTypes'

const CANONICAL_STANDUP_TEMPLATE_ID = 'teamPrompt'

const addTeamPromptTemplate: MutationResolvers['addTeamPromptTemplate'] = async (
  _source,
  {teamId, parentTemplateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  const [teamTemplates, viewerTeam, viewer] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: 'teamPrompt', teamId}),
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  const org = await dataLoader.get('organizations').loadNonNull(viewerTeam.orgId)
  if (getFeatureTier(org) === 'starter' && viewer.freeCustomStandupTemplatesRemaining === 0) {
    throw new GraphQLError('You have reached the limit of free custom templates.')
  }

  const parentTemplate = await dataLoader
    .get('meetingTemplates')
    .load(parentTemplateId ?? CANONICAL_STANDUP_TEMPLATE_ID)
  if (!parentTemplate || !parentTemplate.isActive || parentTemplate.type !== 'teamPrompt') {
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

  const isClone = !!parentTemplateId
  const copyName = `${parentTemplate.name} Copy`
  const existingCopyCount = teamTemplates.filter((template) =>
    template.name.startsWith(copyName)
  ).length
  const name = isClone
    ? existingCopyCount === 0
      ? copyName
      : `${copyName} #${existingCopyCount + 1}`
    : `*New Template #${teamTemplates.length + 1}`

  const newTemplate = new TeamPromptTemplate({
    name,
    teamId,
    orgId: viewerTeam.orgId,
    parentTemplateId: isClone ? parentTemplate.id : undefined,
    illustrationUrl: parentTemplate.illustrationUrl,
    mainCategory: 'standup'
  })

  const parentPrompts = await dataLoader.get('reflectPromptsByTemplateId').load(parentTemplate.id)
  const activeParentPrompts = parentPrompts.filter(({removedAt}) => !removedAt)
  const newPrompts = isClone
    ? activeParentPrompts.map((prompt) => ({
        id: generateUID(),
        teamId,
        templateId: newTemplate.id,
        parentPromptId: prompt.id,
        sortOrder: prompt.sortOrder,
        question: prompt.question,
        description: prompt.description,
        groupColor: prompt.groupColor,
        removedAt: null
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
          groupColor: PALETTE.JADE_400,
          removedAt: null
        }
      ]

  await Promise.all([
    pg
      .with('MeetingTemplateInsert', (qc) => qc.insertInto('MeetingTemplate').values(newTemplate))
      .insertInto('ReflectPrompt')
      .values(newPrompts)
      .execute(),
    decrementFreeTemplatesRemaining(viewerId, 'teamPrompt')
  ])
  dataLoader.clearAll('meetingTemplates')
  viewer.freeCustomStandupTemplatesRemaining = viewer.freeCustomStandupTemplatesRemaining - 1
  analytics.templateMetrics(viewer, newTemplate, isClone ? 'Template Cloned' : 'Template Created')

  const data = {templateId: newTemplate.id}
  publish(SubscriptionChannel.TEAM, teamId, 'AddTeamPromptTemplateSuccess', data, subOptions)
  return data
}

export default addTeamPromptTemplate
