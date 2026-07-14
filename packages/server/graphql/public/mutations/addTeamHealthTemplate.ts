import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import MeetingTemplate from '../../../database/types/MeetingTemplate'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const addTeamHealthTemplate: MutationResolvers['addTeamHealthTemplate'] = async (
  _source,
  {teamId, parentTemplateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const viewerId = getUserId(authToken)

  // VALIDATION
  if (!parentTemplateId) {
    throw new GraphQLError('A team health template must be cloned from a parent template')
  }
  const [allTemplates, viewerTeam, viewer] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: 'teamHealth', teamId}),
    dataLoader.get('teams').load(teamId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!viewerTeam) {
    throw new GraphQLError('Team not found')
  }
  const parentTemplate = await dataLoader.get('meetingTemplates').load(parentTemplateId)
  if (!parentTemplate || parentTemplate.type !== 'teamHealth') {
    throw new GraphQLError('Parent template not found')
  }
  const {name, scope} = parentTemplate
  if (scope === 'TEAM') {
    if (!isTeamMember(authToken, parentTemplate.teamId)) {
      throw new GraphQLError('Template is scoped to team')
    }
  } else if (scope === 'ORGANIZATION') {
    const parentTemplateTeam = await dataLoader.get('teams').load(parentTemplate.teamId)
    const isInOrg =
      parentTemplateTeam && (await isUserInOrg(viewerId, parentTemplateTeam.orgId, dataLoader))
    if (!isInOrg) {
      throw new GraphQLError('Template is scoped to organization')
    }
  }

  // RESOLUTION
  const copyName = `${name} Copy`
  const existingCopyCount = allTemplates.filter((template) =>
    template.name.startsWith(copyName)
  ).length
  const newName = existingCopyCount === 0 ? copyName : `${copyName} #${existingCopyCount + 1}`
  const newTemplate = new MeetingTemplate({
    name: newName,
    teamId,
    orgId: viewerTeam.orgId,
    parentTemplateId,
    type: 'teamHealth',
    mainCategory: 'teamHealth',
    illustrationUrl: parentTemplate.illustrationUrl
  })
  const parentLinks = await dataLoader
    .get('teamHealthTemplateQuestionsByTemplateId')
    .load(parentTemplateId)
  const newLinks = parentLinks.map(({questionId}) => ({templateId: newTemplate.id, questionId}))

  if (newLinks.length > 0) {
    await pg
      .with('MeetingTemplateInsert', (qc) => qc.insertInto('MeetingTemplate').values(newTemplate))
      .insertInto('TeamHealthTemplateQuestion')
      .values(newLinks)
      .execute()
  } else {
    await pg.insertInto('MeetingTemplate').values(newTemplate).execute()
  }

  analytics.templateMetrics(viewer, newTemplate, 'Template Cloned')

  const data = {templateId: newTemplate.id}
  publish(SubscriptionChannel.TEAM, teamId, 'AddTeamHealthTemplateSuccess', data, subOptions)
  return data
}

export default addTeamHealthTemplate
