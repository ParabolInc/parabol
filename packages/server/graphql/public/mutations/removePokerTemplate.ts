import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {
  getUserId,
  isTeamMember,
  isUserBillingLeader,
  isUserOrgAdmin
} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const removePokerTemplate: MutationResolvers['removePokerTemplate'] = async (
  _source,
  {templateId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const now = new Date()
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  const viewerId = getUserId(authToken)

  // AUTH
  if (!template || !template.isActive) {
    return standardError(new Error('Template not found'), {userId: viewerId})
  }
  const [isBillingLeader, isOrgAdmin] = await Promise.all([
    isUserBillingLeader(viewerId, template.orgId, dataLoader),
    isUserOrgAdmin(viewerId, template.orgId, dataLoader)
  ])
  if (!isTeamMember(authToken, template.teamId) && !isBillingLeader && !isOrgAdmin) {
    return standardError(new Error('You are not authorized to remove this template'), {
      userId: viewerId
    })
  }

  // VALIDATION
  const {teamId} = template
  const [templates, settings] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: 'poker', teamId}),
    dataLoader.get('meetingSettingsByType').load({meetingType: 'poker', teamId})
  ])

  // RESOLUTION
  const {id: settingsId} = settings
  template.isActive = false
  await pg
    .with('MeetingTemplateDelete', (qc) =>
      qc.updateTable('MeetingTemplate').set({isActive: false}).where('id', '=', templateId)
    )
    .updateTable('TemplateDimension')
    .set({removedAt: now})
    .where('templateId', '=', templateId)
    .execute()
  dataLoader.clearAll(['meetingTemplates', 'templateDimensions'])

  if (settings.selectedTemplateId === templateId) {
    const nextTemplate = templates.find((template) => template.id !== templateId)
    const nextTemplateId = nextTemplate?.id ?? SprintPokerDefaults.DEFAULT_TEMPLATE_ID
    await getKysely()
      .updateTable('MeetingSettings')
      .set({selectedTemplateId: nextTemplateId})
      .where('id', '=', settingsId)
      .execute()
    dataLoader.clearAll('meetingSettings')
  }

  const data = {templateId, settingsId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplatePayload', data, subOptions)
  return data
}

export default removePokerTemplate
