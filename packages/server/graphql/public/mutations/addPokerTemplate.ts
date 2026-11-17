import {GraphQLError} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import {positionAfter} from '../../../../client/shared/sortOrder'
import PokerTemplate from '../../../database/types/PokerTemplate'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import decrementFreeTemplatesRemaining from '../../../postgres/queries/decrementFreeTemplatesRemaining'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import getUserDetail from '../../../utils/getUserDetail'
import publish from '../../../utils/publish'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import type {MutationResolvers} from '../resolverTypes'

const addPokerTemplate: MutationResolvers['addPokerTemplate'] = async (
  _source,
  {teamId, parentTemplateId},
  {authToken, dataLoader, socketId: mutatorId, resourceGrants}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  // VALIDATION
  const [allTemplates, viewerTeam] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: 'poker', teamId}),
    dataLoader.get('teams').load(teamId)
  ])

  if (!viewerTeam) {
    throw new GraphQLError('Team not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const org = await dataLoader.get('organizations').loadNonNull(viewerTeam.orgId)
  const freeTemplatesRemaining = await getUserDetail(
    viewerId,
    'freeCustomPokerTemplatesRemaining',
    dataLoader
  )
  if (getFeatureTier(org) === 'starter' && freeTemplatesRemaining === 0) {
    throw new GraphQLError('You have reached the limit of free custom templates.', {
      extensions: {code: 'UPGRADE_REQUIRED'}
    })
  }
  let data
  if (parentTemplateId) {
    const parentTemplate = await dataLoader.get('meetingTemplates').load(parentTemplateId)
    if (!parentTemplate) {
      throw new GraphQLError('Parent template not found', {extensions: {code: 'NOT_FOUND'}})
    }
    const {name, scope} = parentTemplate
    if (scope === 'TEAM') {
      if (!isTeamMember(authToken, parentTemplate.teamId))
        throw new GraphQLError('Template is scoped to team', {extensions: {code: 'FORBIDDEN'}})
    } else if (scope === 'ORGANIZATION') {
      const parentTemplateTeam = await dataLoader.get('teams').load(parentTemplate.teamId)
      const isInOrg =
        parentTemplateTeam &&
        (await isUserInOrg(getUserId(authToken), parentTemplateTeam?.orgId, dataLoader)) &&
        (!resourceGrants || (await resourceGrants.hasOrg(parentTemplateTeam.orgId)))
      if (!isInOrg) {
        throw new GraphQLError('Template is scoped to organization', {
          extensions: {code: 'FORBIDDEN'}
        })
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
      decrementFreeTemplatesRemaining(viewerId, 'freeCustomPokerTemplatesRemaining')
    ])
    dataLoader.clearAll(['users', 'userDetails', 'meetingTemplates', 'templateDimensions'])
    data = {templateId: newTemplate.id}
  } else {
    const {orgId} = viewerTeam

    const templateCount = allTemplates.length
    const newTemplate = new PokerTemplate({
      name: `*New Template #${templateCount + 1}`,
      teamId,
      orgId,
      mainCategory: 'estimation',
      illustrationUrl: `/assets/Organization/aGhostOrg/template/estimatedEffortTemplate.png`
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
      decrementFreeTemplatesRemaining(viewerId, 'freeCustomPokerTemplatesRemaining')
    ])
    dataLoader.clearAll(['users', 'userDetails', 'meetingTemplates', 'templateDimensions'])
    data = {templateId}
  }
  publish(SubscriptionChannel.TEAM, teamId, 'AddPokerTemplateSuccess', data, subOptions)
  return data
}

export default addPokerTemplate
