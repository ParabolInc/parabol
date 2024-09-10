import {GraphQLID, GraphQLNonNull} from 'graphql'
import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RemoveReflectTemplatePayload from '../types/RemoveReflectTemplatePayload'

const removeReflectTemplate = {
  description: 'Remove a template full of prompts',
  type: RemoveReflectTemplatePayload,
  args: {
    templateId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source: unknown,
    {templateId}: {templateId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const pg = getKysely()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const template = await dataLoader.get('meetingTemplates').load(templateId)
    const viewerId = getUserId(authToken)

    // AUTH
    if (!template || !template.isActive) {
      return standardError(new Error('Template not found'), {userId: viewerId})
    }
    if (!isTeamMember(authToken, template.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = template
    const [templates, settings] = await Promise.all([
      dataLoader.get('meetingTemplatesByType').load({meetingType: 'retrospective', teamId}),
      dataLoader.get('meetingSettingsByType').load({meetingType: 'retrospective', teamId})
    ])

    // RESOLUTION
    const {id: settingsId} = settings
    await pg
      .with('RemoveTemplate', (qb) =>
        qb.updateTable('MeetingTemplate').set({isActive: false}).where('id', '=', templateId)
      )
      .updateTable('ReflectPrompt')
      .set({removedAt: sql`CURRENT_TIMESTAMP`})
      .where('templateId', '=', templateId)
      .execute()
    dataLoader.clearAll('reflectPrompts')
    if (settings.selectedTemplateId === templateId) {
      const nextTemplate = templates.find((template) => template.id !== templateId)
      const nextTemplateId = nextTemplate?.id ?? 'workingStuckTemplate'
      await getKysely()
        .updateTable('MeetingSettings')
        .set({selectedTemplateId: nextTemplateId})
        .where('id', '=', settingsId)
        .execute()
      dataLoader.clearAll('meetingSettings')
    }

    const data = {templateId, settingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemoveReflectTemplatePayload', data, subOptions)
    return data
  }
}

export default removeReflectTemplate
