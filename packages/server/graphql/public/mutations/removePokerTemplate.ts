import {GraphQLError} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removePokerTemplate: MutationResolvers['removePokerTemplate'] = async (
  _source,
  {templateId},
  {dataLoader, socketId: mutatorId}
) => {
  const now = new Date()
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const template = await dataLoader.get('meetingTemplates').load(templateId)

  // AUTH
  if (!template || !template.isActive) {
    throw new GraphQLError('Template not found', {extensions: {code: 'NOT_FOUND'}})
  }

  // VALIDATION
  const {teamId} = template
  const [templates, settings] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: 'poker', teamId}),
    dataLoader.get('meetingSettingsByType').loadNonNull({meetingType: 'poker', teamId})
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
