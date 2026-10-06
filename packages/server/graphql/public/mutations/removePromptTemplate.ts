import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'
import promptTemplateRules, {isPromptTemplateType} from './helpers/promptTemplateRules'

const removePromptTemplate: MutationResolvers['removePromptTemplate'] = async (
  _source,
  {templateId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  if (!template || !template.isActive || !isPromptTemplateType(template.type)) {
    throw new GraphQLError('Template not found')
  }

  const {teamId, type} = template
  const [templates, settings, activeSeries] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: type, teamId}),
    dataLoader.get('meetingSettingsByType').loadNonNull({meetingType: type, teamId}),
    pg
      .selectFrom('MeetingSeries')
      .select('id')
      .where('templateId', '=', templateId)
      .where('cancelledAt', 'is', null)
      .limit(1)
      .executeTakeFirst()
  ])
  if (activeSeries) {
    throw new GraphQLError('Template is used by a recurring meeting')
  }

  await pg
    .with('RemoveTemplate', (qb) =>
      qb.updateTable('MeetingTemplate').set({isActive: false}).where('id', '=', templateId)
    )
    .updateTable('TemplatePrompt')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('templateId', '=', templateId)
    .execute()
  dataLoader.clearAll(['templatePrompts', 'meetingTemplates'])

  const {id: settingsId} = settings
  if (settings.selectedTemplateId === templateId) {
    const nextTemplate = templates.find((t) => t.id !== templateId)
    const nextTemplateId = nextTemplate?.id ?? promptTemplateRules[type].defaultTemplateId
    await pg
      .updateTable('MeetingSettings')
      .set({selectedTemplateId: nextTemplateId})
      .where('id', '=', settingsId)
      .execute()
    dataLoader.clearAll('meetingSettings')
  }

  const data = {templateId, settingsId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemovePromptTemplateSuccess', data, subOptions)
  return data
}

export default removePromptTemplate
