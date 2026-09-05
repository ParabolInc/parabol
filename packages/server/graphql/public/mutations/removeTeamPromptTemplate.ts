import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const CANONICAL_STANDUP_TEMPLATE_ID = 'teamPrompt'

const removeTeamPromptTemplate: MutationResolvers['removeTeamPromptTemplate'] = async (
  _source,
  {templateId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  if (!template || !template.isActive || template.type !== 'teamPrompt') {
    throw new GraphQLError('Template not found')
  }

  const {teamId} = template
  const [templates, settings, activeSeries] = await Promise.all([
    dataLoader.get('meetingTemplatesByType').load({meetingType: 'teamPrompt', teamId}),
    dataLoader.get('meetingSettingsByType').loadNonNull({meetingType: 'teamPrompt', teamId}),
    pg
      .selectFrom('MeetingSeries')
      .select('id')
      .where('templateId', '=', templateId)
      .where('cancelledAt', 'is', null)
      .limit(1)
      .executeTakeFirst()
  ])
  if (activeSeries) {
    throw new GraphQLError('Template is used by a recurring standup')
  }

  await pg
    .with('RemoveTemplate', (qb) =>
      qb.updateTable('MeetingTemplate').set({isActive: false}).where('id', '=', templateId)
    )
    .updateTable('ReflectPrompt')
    .set({removedAt: sql`CURRENT_TIMESTAMP`})
    .where('templateId', '=', templateId)
    .execute()
  dataLoader.clearAll(['reflectPrompts', 'meetingTemplates'])

  const {id: settingsId} = settings
  if (settings.selectedTemplateId === templateId) {
    const nextTemplate = templates.find((t) => t.id !== templateId)
    const nextTemplateId = nextTemplate?.id ?? CANONICAL_STANDUP_TEMPLATE_ID
    await pg
      .updateTable('MeetingSettings')
      .set({selectedTemplateId: nextTemplateId})
      .where('id', '=', settingsId)
      .execute()
    dataLoader.clearAll('meetingSettings')
  }

  const data = {templateId, settingsId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveTeamPromptTemplateSuccess', data, subOptions)
  return data
}

export default removeTeamPromptTemplate
