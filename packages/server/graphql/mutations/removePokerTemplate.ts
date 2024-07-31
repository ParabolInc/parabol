import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SprintPokerDefaults, SubscriptionChannel} from 'parabol-client/types/constEnums'
import getRethink from '../../database/rethinkDriver'
import MeetingSettingsPoker from '../../database/types/MeetingSettingsPoker'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import RemovePokerTemplatePayload from '../types/RemovePokerTemplatePayload'

const removePokerTemplate = {
  description: 'Remove a poker meeting template',
  type: new GraphQLNonNull(RemovePokerTemplatePayload),
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
    const r = await getRethink()
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
    if (!isTeamMember(authToken, template.teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const {teamId} = template
    const [templates, settings] = await Promise.all([
      dataLoader.get('meetingTemplatesByType').load({meetingType: 'poker', teamId}),
      r
        .table('MeetingSettings')
        .getAll(teamId, {index: 'teamId'})
        .filter({meetingType: 'poker'})
        .nth(0)
        .run() as unknown as MeetingSettingsPoker
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
      await r
        .table('MeetingSettings')
        .get(settingsId)
        .update({
          selectedTemplateId: nextTemplateId
        })
        .run()
    }

    const data = {templateId, settingsId}
    publish(SubscriptionChannel.TEAM, teamId, 'RemovePokerTemplatePayload', data, subOptions)
    return data
  }
}

export default removePokerTemplate
